"""
DocuMind - services/query_service.py
Purpose : RAG orchestration business logic — session handling, retrieval, generation
"""
import uuid
import time
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import structlog

from app.models.user import User
from app.models.session import QuerySession, QueryMessage, MessageRole
from app.schemas.query import AskRequest, AskResponse, SourceChunk
from app.pipeline.embedder import embed_single
from app.rag.retriever import retrieve_chunks, format_sources
from app.rag.chain import run_rag_chain
from app.core import metrics

from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()

class QueryService:
    async def ask_question(
        self, 
        db: AsyncSession, 
        user: User, 
        payload: AskRequest
    ) -> AskResponse:
        """
        Orchestrates the RAG flow.
        """
        start_time = time.perf_counter()

        # 1. Session Management
        if payload.session_id:
            stmt = select(QuerySession).where(
                QuerySession.id == payload.session_id,
                QuerySession.user_id == user.id
            )
            result = await db.execute(stmt)
            query_session = result.scalar_one_or_none()
            if not query_session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Query session not found or access denied."
                )
        else:
            title = payload.question[:50]
            query_session = QuerySession(
                user_id=user.id,
                document_id=payload.document_id,
                title=title
            )
            db.add(query_session)
            await db.flush()

        # 2. History Assembly
        stmt = (
            select(QueryMessage)
            .where(QueryMessage.session_id == query_session.id)
            .order_by(QueryMessage.created_at.desc())
            .limit(settings.conversation_history_pairs * 2)
        )
        history_result = await db.execute(stmt)
        history_messages = list(history_result.scalars().all())
        history_messages.reverse()  # Chronological order

        # 3. Embedding & Retrieval
        query_vec = embed_single(payload.question)
        retrieved = await retrieve_chunks(
            query=payload.question,  # NEW: pass raw string for FTS
            query_embedding=query_vec,
            db=db,
            user_id=user.id,
            document_id=payload.document_id
        )

        # 4. Handle Empty Retrieval
        if not retrieved:
            metrics.rag_queries_total.labels(status="failed").inc()
            answer = "I could not find relevant information in the uploaded documents."
            sources = []
            prompt_tokens = 0
            completion_tokens = 0
        else:
            # 5. RAG Chain Execution
            sources = format_sources(retrieved)
            result = await run_rag_chain(
                question=payload.question,
                chunks=retrieved,
                history=history_messages,
                model=payload.model
            )
            answer = result["answer"]
            prompt_tokens = result["prompt_tokens"]
            completion_tokens = result["completion_tokens"]
            
            metrics.rag_queries_total.labels(status="success").inc()
            metrics.groq_tokens_total.inc(prompt_tokens + completion_tokens)

        latency_ms = round((time.perf_counter() - start_time) * 1000)

        # 6. Persist Conversation
        user_msg = QueryMessage(
            session_id=query_session.id,
            role=MessageRole.user,
            content=payload.question
        )
        assistant_msg = QueryMessage(
            session_id=query_session.id,
            role=MessageRole.assistant,
            content=answer,
            source_chunks={"sources": sources} if retrieved else None,
            latency_ms=latency_ms,
            prompt_tokens=prompt_tokens
        )
        db.add_all([user_msg, assistant_msg])
        await db.commit()

        return AskResponse(
            answer=answer,
            session_id=query_session.id,
            sources=[SourceChunk(**s) for s in sources],
            latency_ms=latency_ms
        )

    async def list_sessions(
        self,
        db: AsyncSession,
        user: User,
        page: int = 1,
        page_size: int = 20
    ) -> list:
        """List user sessions with message counts."""
        offset = (page - 1) * page_size
        
        count_stmt = (
            select(
                QueryMessage.session_id,
                func.count(QueryMessage.id).label("message_count")
            )
            .group_by(QueryMessage.session_id)
            .subquery()
        )

        stmt = (
            select(
                QuerySession.id,
                QuerySession.title,
                QuerySession.document_id,
                QuerySession.created_at,
                func.coalesce(count_stmt.c.message_count, 0).label("message_count")
            )
            .outerjoin(count_stmt, QuerySession.id == count_stmt.c.session_id)
            .where(QuerySession.user_id == user.id)
            .order_by(desc(QuerySession.created_at))
            .limit(page_size)
            .offset(offset)
        )

        result = await db.execute(stmt)
        return result.all()

    async def get_session(
        self,
        db: AsyncSession,
        session_id: uuid.UUID,
        user: User
    ) -> QuerySession:
        """Get session detail with ownership check."""
        stmt = (
            select(QuerySession)
            .options(selectinload(QuerySession.messages))
            .where(QuerySession.id == session_id)
        )
        result = await db.execute(stmt)
        query_session = result.scalar_one_or_none()

        if not query_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        if query_session.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return query_session

    async def delete_session(
        self,
        db: AsyncSession,
        session_id: uuid.UUID,
        user: User
    ) -> None:
        """Delete session with ownership check."""
        query_session = await self.get_session(db, session_id, user)
        await db.delete(query_session)
        await db.commit()

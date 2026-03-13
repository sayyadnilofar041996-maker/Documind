"""
DocuMind - api/v1/query.py
Purpose : Q&A endpoints — ask question (RAG), list sessions
Phase   : 4 — Query System
"""

import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.session import QuerySession, QueryMessage, MessageRole
from app.schemas.query import AskRequest, AskResponse, SourceChunk
from app.schemas.common import ErrorResponse
from app.pipeline.embedder import embed_single
from app.rag.retriever import retrieve_chunks, format_sources
from app.rag.chain import run_rag_chain
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.post(
    "/ask",
    response_model=AskResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    }
)
async def ask_question(
    request: AskRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Core RAG endpoint:
    1. Retrieve relevant chunks based on question embedding
    2. Assemble session history
    3. Generate answer using Groq RAG chain
    4. Save conversation to database
    """
    start_time = time.perf_counter()

    # Step 1: Session Management
    query_session = None
    if request.session_id:
        # Load existing session and verify ownership
        stmt = select(QuerySession).where(
            QuerySession.id == request.session_id,
            QuerySession.user_id == current_user.id
        )
        result = await db.execute(stmt)
        query_session = result.scalar_one_or_none()
        if not query_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Query session not found or access denied."
            )
    else:
        # Create new session
        title = request.question[:50]
        query_session = QuerySession(
            user_id=current_user.id,
            document_id=request.document_id,
            title=title
        )
        db.add(query_session)
        await db.flush()  # Populate query_session.id

    # Step 2: Question Embedding
    # Runs CPU-bound embedding in the same process (fast for single strings)
    query_vec = embed_single(request.question)

    # Step 3: Chunk Retrieval
    # Uses pgvector cosine similarity search
    results = await retrieve_chunks(
        query_embedding=query_vec,
        db=db,
        user_id=current_user.id,
        document_id=request.document_id
    )

    # Step 4: Graceful Fallback if no relevant context
    if not results:
        answer = "I could not find this information in your documents."
        sources = []
        prompt_tokens = 0
    else:
        # Step 5: Charge History
        # Retrieve last N messages (N user + N assistant pairs)
        stmt = (
            select(QueryMessage)
            .where(QueryMessage.session_id == query_session.id)
            .order_by(QueryMessage.created_at.desc())
            .limit(settings.conversation_history_pairs * 2)
        )
        history_result = await db.execute(stmt)
        messages = list(history_result.scalars().all())
        messages.reverse()  # Chronological order [oldest -> newest]

        # Step 6: RAG Chain Execution
        # Orchestrates prompt assembly and LLM call
        answer, prompt_tokens = await run_rag_chain(
            question=request.question,
            chunks=results,
            history=messages,
            db=db
        )
        sources = format_sources(results)

    # Step 7: Finalize and Save
    latency_ms = int((time.perf_counter() - start_time) * 1000)

    # Save user question
    user_msg = QueryMessage(
        session_id=query_session.id,
        role=MessageRole.user,
        content=request.question
    )
    
    # Save assistant answer
    assistant_msg = QueryMessage(
        session_id=query_session.id,
        role=MessageRole.assistant,
        content=answer,
        source_chunks={"sources": sources} if sources else None,
        latency_ms=latency_ms,
        prompt_tokens=prompt_tokens
    )
    
    db.add_all([user_msg, assistant_msg])
    await db.commit()

    return AskResponse(
        answer=answer,
        session_id=query_session.id,
        latency_ms=latency_ms,
        sources=[SourceChunk(**src) for src in sources]
    )

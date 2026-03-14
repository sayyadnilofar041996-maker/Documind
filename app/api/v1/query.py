"""
DocuMind - api/v1/query.py
Purpose : Q&A endpoints — ask question (RAG), session management
Phase   : 4 & 5
"""

import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.session import QuerySession, QueryMessage, MessageRole
from app.schemas.query import (
    AskRequest, AskResponse, SourceChunk,
    SessionListResponse, SessionDetailResponse, MessageResponse
)
from app.schemas.common import ErrorResponse
from app.pipeline.embedder import embed_single
from app.rag.retriever import retrieve_chunks, format_sources
from app.rag.chain import run_rag_chain
from app.config import get_settings
from app.main import limiter

settings = get_settings()
router = APIRouter()


@router.post(
    "/ask",
    response_model=AskResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    }
)
@limiter.limit("10/minute")
async def ask_question(
    request: Request,
    payload: AskRequest,
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
    if payload.session_id:
        # Load existing session and verify ownership
        stmt = select(QuerySession).where(
            QuerySession.id == payload.session_id,
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
        title = payload.question[:50]
        query_session = QuerySession(
            user_id=current_user.id,
            document_id=payload.document_id,
            title=title
        )
        db.add(query_session)
        await db.flush()  # Populate query_session.id

    # Step 2: Question Embedding
    query_vec = embed_single(payload.question)

    # Step 3: Chunk Retrieval
    results = await retrieve_chunks(
        query_embedding=query_vec,
        db=db,
        user_id=current_user.id,
        document_id=payload.document_id
    )

    # Step 4: Graceful Fallback if no relevant context
    if not results:
        answer = "I could not find this information in your documents."
        sources = []
        prompt_tokens = 0
    else:
        # Step 5: History Assembly
        stmt = (
            select(QueryMessage)
            .where(QueryMessage.session_id == query_session.id)
            .order_by(QueryMessage.created_at.desc())
            .limit(settings.conversation_history_pairs * 2)
        )
        history_result = await db.execute(stmt)
        messages = list(history_result.scalars().all())
        messages.reverse()  # Chronological order

        # Step 6: RAG Chain Execution
        answer, prompt_tokens = await run_rag_chain(
            question=payload.question,
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
        content=payload.question
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


@router.get(
    "/sessions",
    response_model=list[SessionListResponse],
    responses={401: {"model": ErrorResponse}}
)
async def list_sessions(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List user sessions with message counts, newest first.
    """
    offset = (page - 1) * page_size
    
    # Subquery for message count per session
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
        .where(QuerySession.user_id == current_user.id)
        .order_by(desc(QuerySession.created_at))
        .limit(page_size)
        .offset(offset)
    )

    result = await db.execute(stmt)
    sessions = result.all()
    
    return [
        SessionListResponse(
            id=s.id,
            title=s.title,
            document_id=s.document_id,
            message_count=s.message_count,
            created_at=s.created_at
        )
        for s in sessions
    ]


@router.get(
    "/sessions/{session_id}",
    response_model=SessionDetailResponse,
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    }
)
async def get_session_detail(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get session details with full message history.
    """
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
    
    if query_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this session"
        )

    # Sort messages by creation time
    sorted_messages = sorted(query_session.messages, key=lambda m: m.created_at)

    return SessionDetailResponse(
        id=query_session.id,
        title=query_session.title,
        document_id=query_session.document_id,
        created_at=query_session.created_at,
        messages=[
            MessageResponse(
                id=m.id,
                role=m.role,
                content=m.content,
                source_chunks=m.source_chunks,
                latency_ms=m.latency_ms,
                created_at=m.created_at
            )
            for m in sorted_messages
        ]
    )


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    }
)
async def delete_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a session and all its messages.
    """
    stmt = select(QuerySession).where(QuerySession.id == session_id)
    result = await db.execute(stmt)
    query_session = result.scalar_one_or_none()

    if not query_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if query_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this session"
        )

    await db.delete(query_session)
    await db.commit()
    return None

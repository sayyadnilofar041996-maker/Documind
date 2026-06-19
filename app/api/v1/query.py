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

from app.dependencies import get_db, get_current_user, get_query_service
from app.models.user import User
from app.services.query_service import QueryService
from app.schemas.query import (
    AskRequest, AskResponse, SourceChunk,
    SessionListResponse, SessionDetailResponse, MessageResponse
)
from app.schemas.common import ErrorResponse
from app.main import limiter
from app.config import get_settings

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
    query_service: QueryService = Depends(get_query_service),
):
    """
    RAG endpoint delegating to QueryService.
    """
    return await query_service.ask_question(db, current_user, payload)


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
    query_service: QueryService = Depends(get_query_service),
):
    """
    List user sessions via QueryService.
    """
    sessions = await query_service.list_sessions(db, current_user, page, page_size)
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
    query_service: QueryService = Depends(get_query_service),
):
    """
    Get session detail via QueryService.
    """
    session = await query_service.get_session(db, session_id, current_user)
    
    # Sort messages by creation time
    sorted_messages = sorted(session.messages, key=lambda m: m.created_at)

    return SessionDetailResponse(
        id=session.id,
        title=session.title,
        document_id=session.document_id,
        created_at=session.created_at,
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
    query_service: QueryService = Depends(get_query_service),
):
    """
    Delete session via QueryService.
    """
    await query_service.delete_session(db, session_id, current_user)
    return None

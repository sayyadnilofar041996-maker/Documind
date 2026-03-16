"""
DocuMind - api/v1/documents.py
Purpose : Document endpoints — upload, list, get, status, delete
Phase   : 2 — File Upload
"""

import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, UploadFile, File, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.document import DocumentStatus
from app.services.document_service import DocumentService
from app.schemas.document import DocumentRead, DocumentStatusRead, DocumentStatusFull, ChunkRead
from app.schemas.common import PaginatedResponse, ErrorResponse
from app.main import limiter

router = APIRouter()
doc_service = DocumentService()


# ── POST /upload ──────────────────────────────────────────────
@router.post(
    "/upload",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    }
)
@limiter.limit("50/minute")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a document for processing.
    Validates file type (PDF, DOCX, etc.), size, and deduplicates.
    Returns 201 Created and document metadata.
    """
    return await doc_service.upload_document(db, file, current_user.id)


# ── GET / ─────────────────────────────────────────────────────
@router.get(
    "/",
    response_model=PaginatedResponse[DocumentRead],
)
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: DocumentStatus | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all documents owned by the current user.
    Supports pagination and status filtering.
    """
    items, total = await doc_service.list_documents(
        db, 
        current_user.id, 
        page, 
        page_size, 
        status
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


# ── GET /{id} ─────────────────────────────────────────────────
@router.get(
    "/{id}",
    response_model=DocumentRead,
    responses={404: {"model": ErrorResponse}}
)
async def get_document(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed metadata for a specific document.
    Must be the owner.
    """
    return await doc_service.get_document(db, id, current_user.id)


# ── GET /{id}/status ──────────────────────────────────────────
@router.get(
    "/{id}/status",
    response_model=DocumentStatusFull,
    responses={404: {"model": ErrorResponse}}
)
async def get_document_status(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Enhanced endpoint for polling document processing status.
    Includes Celery state and progress percentage.
    """
    status_info = await doc_service.get_enhanced_status(db, id, current_user.id)
    return status_info


# ── GET /{id}/chunks ──────────────────────────────────────────
@router.get(
    "/{id}/chunks",
    response_model=PaginatedResponse[ChunkRead],
    responses={
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse}
    }
)
async def get_document_chunks(
    id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get paginated chunks for a specific document.
    Must be the owner. Does not return embedding vectors.
    """
    items, total = await doc_service.get_document_chunks(
        db, id, current_user.id, page, page_size
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


# ── DELETE /{id} ──────────────────────────────────────────────
@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}}
)
async def delete_document(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a document and its associated file.
    Must be the owner.
    """
    await doc_service.delete_document(db, id, current_user.id)
    return None

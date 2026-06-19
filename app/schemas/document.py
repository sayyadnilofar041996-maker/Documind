"""
DocuMind - schemas/document.py
Purpose : Pydantic v2 schemas for document upload, status, chunks
Phase   : 2 — File Upload
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.document import FileType, DocumentStatus


class DocumentBase(BaseModel):
    """Base fields for documents."""
    original_filename: str = Field(..., max_length=255)
    file_type: FileType


class DocumentCreate(DocumentBase):
    """Schema for document creation (internal use)."""
    stored_filename: str = Field(..., max_length=255)
    file_size_bytes: int = Field(..., gt=0)
    file_sha256: str = Field(..., min_length=64, max_length=64)


class DocumentUpdate(BaseModel):
    """Schema for updating document status or metadata."""
    status: DocumentStatus | None = None
    chunk_count: int | None = None
    celery_task_id: str | None = None
    error_message: str | None = None


class DocumentRead(DocumentBase):
    """Full document response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    file_size_bytes: int
    status: DocumentStatus
    chunk_count: int
    created_at: datetime
    updated_at: datetime


class DocumentStatusRead(BaseModel):
    """Lightweight document status schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: DocumentStatus
    chunk_count: int
    error_message: str | None = None


class DocumentStatusFull(DocumentStatusRead):
    """Enhanced document status with Celery task state."""
    celery_state: str | None = Field(None, description="Celery task state (e.g., PENDING, SUCCESS, FAILURE)")
    progress_pct: float = Field(0.0, ge=0.0, le=100.0)
    updated_at: datetime


class ChunkRead(BaseModel):
    """Schema for document chunks (no embedding)."""
    model_config = ConfigDict(from_attributes=True)

    text: str
    page_number: int | None = None
    chunk_index: int
    token_count: int

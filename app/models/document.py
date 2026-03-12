"""
DocuMind - models/document.py
Purpose : SQLAlchemy Document ORM model + FileType/DocumentStatus enums
Phase   : 1 — Foundation
"""

import uuid
import enum
from datetime import datetime, timezone
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer, BigInteger, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.chunk import DocumentChunk


class FileType(str, enum.Enum):
    PDF = "pdf"
    DOCX = "docx"
    PYTHON = "py"
    JAVASCRIPT = "js"
    TYPESCRIPT = "ts"
    MARKDOWN = "md"


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Document(Base):
    """
    Document model for storing document metadata and processing status.
    """
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    
    original_filename: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    stored_filename: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    file_type: Mapped[FileType] = mapped_column(
        Enum(FileType), 
        nullable=False
    )
    file_size_bytes: Mapped[int] = mapped_column(
        BigInteger, 
        nullable=False
    )
    file_sha256: Mapped[str] = mapped_column(
        String(64), 
        index=True, 
        nullable=False
    )
    
    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus), 
        default=DocumentStatus.PENDING,
        index=True
    )
    chunk_count: Mapped[int] = mapped_column(
        Integer, 
        default=0
    )
    celery_task_id: Mapped[str | None] = mapped_column(
        String(255), 
        nullable=True
    )
    error_message: Mapped[str | None] = mapped_column(
        String(1000), 
        nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ──────────────────────────────────────────
    owner: Mapped["User"] = relationship(
        back_populates="documents"
    )
    chunks: Mapped[List["DocumentChunk"]] = relationship(
        back_populates="document", 
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Document {self.original_filename} ({self.status})>"

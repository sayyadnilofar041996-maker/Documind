"""
DocuMind - models/document.py
Purpose : SQLAlchemy Document ORM model + FileType/DocumentStatus enums
Phase   : 1
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
import uuid
import enum
from datetime import datetime
from . import Base

class FileType(str, enum.Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    PYTHON = "py"
    JAVASCRIPT = "js"
    JSX = "jsx"
    TYPESCRIPT = "ts"
    TSX = "tsx"
    MARKDOWN = "md"
    CSS = "css"
    HTML = "html"
    JAVA = "java"
    C = "c"
    CPP = "cpp"
    H = "h"
    HPP = "hpp"
    RUBY = "rb"
    GO = "go"
    RUST = "rs"
    PHP = "php"
    SWIFT = "swift"
    KOTLIN = "kt"

class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"

class Document(Base):
    __tablename__ = "documents"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    original_filename: Mapped[str] = mapped_column(String(255))
    stored_filename: Mapped[str] = mapped_column(String(255))
    file_type: Mapped[FileType] = mapped_column(SQLEnum(FileType))
    file_size_bytes: Mapped[int] = mapped_column(Integer)
    file_sha256: Mapped[str] = mapped_column(String(64))
    status: Mapped[DocumentStatus] = mapped_column(SQLEnum(DocumentStatus), default=DocumentStatus.PENDING)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

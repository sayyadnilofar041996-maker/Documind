"""
DocuMind - models/chunk.py
Purpose : SQLAlchemy DocumentChunk ORM model with Vector(384) embedding
Phase   : 1
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, Text
import sqlalchemy as sa
import uuid
from pgvector.sqlalchemy import Vector
from . import Base

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer)
    token_count: Mapped[int] = mapped_column(Integer)
    
    # Full-Text Search (FTS) — managed by PostgreSQL as GENERATED column
    # We use FetchedValue() to tell SQLAlchemy NOT to include this in INSERTS/UPDATES
    search_vector: Mapped[str | None] = mapped_column(
        Text, 
        nullable=True, 
        deferred=True, 
        server_default=sa.FetchedValue()
    )

    document = relationship("Document", back_populates="chunks")

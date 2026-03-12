"""
DocuMind - models/chunk.py
Purpose : SQLAlchemy DocumentChunk ORM model with Vector(384) embedding
Phase   : 1 — Foundation
"""

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.document import Document


class DocumentChunk(Base):
    """
    Model for individual chunks of a document, including their vector embeddings.
    """
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    
    text: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    embedding: Mapped[list[float]] = mapped_column(
        Vector(384), 
        nullable=False
    )
    page_number: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    token_count: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )

    # ── Relationships ──────────────────────────────────────────
    document: Mapped["Document"] = relationship(
        back_populates="chunks"
    )

    def __repr__(self) -> str:
        return f"<DocumentChunk doc={self.document_id} index={self.chunk_index}>"

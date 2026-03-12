"""
DocuMind - models/session.py
Purpose : QuerySession + QueryMessage ORM models + MessageRole enum
Phase   : 1 — Foundation
"""

import uuid
import enum
from datetime import datetime, timezone
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Text, JSON, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.document import Document


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"


class QuerySession(Base):
    """
    Model for a chat session between a user and a document.
    """
    __tablename__ = "query_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("documents.id", ondelete="SET NULL"), 
        index=True, 
        nullable=True
    )
    
    title: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ──────────────────────────────────────────
    user: Mapped["User"] = relationship(
        back_populates="sessions"
    )
    messages: Mapped[List["QueryMessage"]] = relationship(
        back_populates="session", 
        cascade="all, delete-orphan",
        order_by="QueryMessage.created_at"
    )

    def __repr__(self) -> str:
        return f"<QuerySession {self.title}>"


class QueryMessage(Base):
    """
    Model for individual messages within a query session.
    """
    __tablename__ = "query_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("query_sessions.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    
    role: Mapped[MessageRole] = mapped_column(
        Enum(MessageRole), 
        nullable=False
    )
    content: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    source_chunks: Mapped[list | None] = mapped_column(
        JSON, 
        nullable=True
    )
    
    latency_ms: Mapped[int | None] = mapped_column(
        Integer, 
        nullable=True
    )
    prompt_tokens: Mapped[int | None] = mapped_column(
        Integer, 
        nullable=True
    )
    completion_tokens: Mapped[int | None] = mapped_column(
        Integer, 
        nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ──────────────────────────────────────────
    session: Mapped["QuerySession"] = relationship(
        back_populates="messages"
    )

    def __repr__(self) -> str:
        return f"<QueryMessage {self.role}>"

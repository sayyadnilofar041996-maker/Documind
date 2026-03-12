"""
DocuMind - models/token.py
Purpose : RefreshToken ORM model for JWT refresh token rotation
Phase   : 2 — Authentication
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class RefreshToken(Base):
    """
    Model for storing hashed refresh tokens to support rotation and revocation.
    """
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    
    token_hash: Mapped[str] = mapped_column(
        String(64), 
        unique=True, 
        index=True, 
        nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False
    )
    revoked: Mapped[bool] = mapped_column(
        Boolean, 
        default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ──────────────────────────────────────────
    user: Mapped["User"] = relationship(
        back_populates="refresh_tokens"
    )

    def __repr__(self) -> str:
        return f"<RefreshToken user={self.user_id} revoked={self.revoked}>"

"""
DocuMind - services/auth_service.py
Purpose : Auth business logic — register, login, token rotation, logout
Phase   : 2
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.token import RefreshToken
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse
import structlog

if TYPE_CHECKING:
    pass

settings = get_settings()
logger = structlog.get_logger()


# ─────────────────────────── Register ────────────────────────────

async def register_user(db: AsyncSession, payload: RegisterRequest) -> User:
    """
    Create a new User after ensuring email and username are unique.

    Raises
    ------
    ValueError
        With a descriptive message when email or username is already taken.
    """
    # Check uniqueness
    existing_email = await db.scalar(
        select(User).where(User.email == payload.email)
    )
    if existing_email:
        raise ValueError("email already registered")

    existing_username = await db.scalar(
        select(User).where(User.username == payload.username)
    )
    if existing_username:
        raise ValueError("username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.refresh(user)
    logger.info("auth.user_registered",
                user_id=str(user.id),
                email=user.email,
                username=user.username)
    return user


# ─────────────────────────── Login ───────────────────────────────

async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Return the User if credentials are valid, otherwise None."""
    user: User | None = await db.scalar(select(User).where(User.email == email))
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        logger.warning("auth.login_failed",
                       email=email,
                       reason="invalid_password")
        return None
    if not user.is_active:
        return None
    
    logger.info("auth.user_logged_in",
                user_id=str(user.id),
                email=user.email)
    return user


async def issue_token_pair(db: AsyncSession, user: User) -> TokenResponse:
    """
    Mint a fresh access + refresh token pair and persist the refresh token hash.
    """
    access_token = create_access_token(str(user.id))
    raw_refresh, refresh_hash = create_refresh_token()

    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    db_token = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=expires_at,
    )
    db.add(db_token)
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=raw_refresh)


# ─────────────────────────── Refresh (token rotation) ────────────

async def rotate_refresh_token(db: AsyncSession, raw_token: str) -> TokenResponse:
    """
    Validate *raw_token*, revoke it, and issue a fresh token pair.

    Raises
    ------
    ValueError
        When the token is not found, already revoked, or expired.
    """
    token_hash = hash_refresh_token(raw_token)

    db_token: RefreshToken | None = await db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )

    if db_token is None:
        logger.warning("auth.refresh_failed",
                       reason="token_not_found_or_expired")
        raise ValueError("refresh token not found")
    if db_token.revoked:
        raise ValueError("refresh token has been revoked")
    if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise ValueError("refresh token has expired")

    # Revoke the old token (token rotation — one-time use)
    db_token.revoked = True
    await db.flush()

    # Load the associated user
    user: User | None = await db.get(User, db_token.user_id)
    if user is None or not user.is_active:
        await db.commit()
        raise ValueError("user not found or inactive")

    logger.info("auth.token_refreshed", user_id=str(user.id))

    # Issue new pair
    access_token = create_access_token(str(user.id))
    raw_new, new_hash = create_refresh_token()

    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    new_db_token = RefreshToken(
        user_id=user.id,
        token_hash=new_hash,
        expires_at=expires_at,
    )
    db.add(new_db_token)
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=raw_new)


# ─────────────────────────── Logout ──────────────────────────────

async def revoke_refresh_token(db: AsyncSession, raw_token: str) -> None:
    """
    Revoke a refresh token by its hash.  Silently succeeds if not found
    (idempotent logout).
    """
    token_hash = hash_refresh_token(raw_token)
    db_token: RefreshToken | None = await db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    if db_token and not db_token.revoked:
        db_token.revoked = True
        await db.commit()
        logger.info("auth.user_logged_out", user_id=str(db_token.user_id))

"""
DocuMind - api/v1/auth.py
Purpose : Auth endpoints — register, login, refresh, logout, me
Phase   : 2

All error responses follow RFC 7807 Problem Details format.
"""
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services import auth_service

router = APIRouter(tags=["auth"])

# ── Helper: RFC 7807 exception factory ───────────────────────────

def _problem(
    status_code: int,
    title: str,
    detail: str,
    instance: str = "about:blank",
    type_uri: str = "about:blank",
) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={
            "type": type_uri,
            "title": title,
            "status": status_code,
            "detail": detail,
            "instance": instance,
        },
    )


# ── POST /auth/register ───────────────────────────────────────────

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    try:
        user = await auth_service.register_user(db, payload)
    except ValueError as exc:
        raise _problem(
            status_code=status.HTTP_409_CONFLICT,
            title="Registration Conflict",
            detail=str(exc),
            instance=str(request.url),
            type_uri="https://documind.local/problems/registration-conflict",
        )
    return UserResponse.model_validate(user)


# ── POST /auth/login ──────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive an access + refresh token pair",
)
async def login(
    payload: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    user = await auth_service.authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise _problem(
            status_code=status.HTTP_401_UNAUTHORIZED,
            title="Authentication Failed",
            detail="Invalid email or password.",
            instance=str(request.url),
            type_uri="https://documind.local/problems/invalid-credentials",
        )
    return await auth_service.issue_token_pair(db, user)


# ── POST /auth/refresh ────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Rotate refresh token and receive a new access + refresh pair",
)
async def refresh(
    payload: RefreshRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    try:
        return await auth_service.rotate_refresh_token(db, payload.refresh_token)
    except ValueError as exc:
        raise _problem(
            status_code=status.HTTP_401_UNAUTHORIZED,
            title="Token Refresh Failed",
            detail=str(exc),
            instance=str(request.url),
            type_uri="https://documind.local/problems/invalid-refresh-token",
        )


# ── POST /auth/logout ─────────────────────────────────────────────

@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke the provided refresh token (logout)",
)
async def logout(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> None:
    # Idempotent — silently succeeds even if token is unknown/already revoked
    await auth_service.revoke_refresh_token(db, payload.refresh_token)


# ── GET /auth/me ──────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Return the currently authenticated user's profile",
)
async def me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    return UserResponse.model_validate(current_user)

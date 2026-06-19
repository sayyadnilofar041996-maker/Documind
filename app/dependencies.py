"""
DocuMind - dependencies.py
Purpose : FastAPI dependency injection — get_db, get_current_user, get_optional_user
Phase   : 1 — Foundation
"""
import uuid
from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import decode_access_token

# ── HTTP Bearer Security Scheme ───────────────────────────────
# Extracts token from: Authorization: Bearer <token>
# auto_error=False → we handle the error ourselves (custom RFC 7807 message)
bearer_scheme = HTTPBearer(auto_error=False)


# ── Database Session Dependency ───────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yields an async database session for each request.
    Session is automatically closed and rolled back on exceptions.

    Usage in routes:
      async def my_route(db: AsyncSession = Depends(get_db)):
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Current User Dependency ───────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Validates JWT token and returns current authenticated user.

    Flow:
      1. Extract Bearer token from Authorization header
      2. Decode + validate JWT token
      3. Load User from database using user_id from token
      4. Verify user exists and is active
      5. Return User object

    Usage in routes:
      async def my_route(
          current_user: User = Depends(get_current_user)
      ):
    """
    # Generic 401 — never reveal specific failure reason (security)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "type": "https://documind.io/errors/422",
            "title": "Unauthorized",
            "status": 401,
            "detail": "Could not validate credentials.",
            "instance": "about:blank",
        },
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Step 1: Check token exists
    if credentials is None:
        raise credentials_exception

    # Step 2: Decode JWT token
    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Step 3: Parse user_id UUID
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    # Step 4: Load user from database (import here to avoid circular)
    from app.models.user import User
    user = await db.get(User, user_id)

    # Step 5: Verify user exists and is active
    if user is None or not user.is_active:
        raise credentials_exception

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Like get_current_user but returns None instead of raising 401.
    Used for endpoints that work both authenticated and unauthenticated.
    """
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


# ── Service Dependencies ───────────────────────────────────────
def get_document_service():
    from app.services.document_service import DocumentService
    return DocumentService()

def get_query_service():
    from app.services.query_service import QueryService
    return QueryService()

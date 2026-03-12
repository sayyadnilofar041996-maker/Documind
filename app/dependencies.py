"""
DocuMind - dependencies.py
Purpose : FastAPI dependency injection — get_db, get_current_user
Phase   : 1 — Foundation
"""

import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.core.database import AsyncSessionLocal
from app.core.security import decode_access_token
from app.config import get_settings

settings = get_settings()

# ── HTTP Bearer Security Scheme ───────────────────────────────
# Extracts token from: Authorization: Bearer <token>
# auto_error=False → we handle the error ourselves (custom message)
bearer_scheme = HTTPBearer(auto_error=False)


# ── Database Session Dependency ───────────────────────────────
async def get_db() -> AsyncSession:
    """
    Yields an async database session for each request.
    Session is automatically closed after request completes.
    
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

    Raises 401 on any failure:
      - Missing token
      - Invalid/expired token
      - User not found
      - User deactivated
    
    Usage in routes:
      async def my_route(
          current_user: User = Depends(get_current_user)
      ):
    """
    # Generic 401 error — never reveal specific reason (security)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Step 1: Check token exists
    if credentials is None:
        raise credentials_exception

    # Step 2: Decode JWT token
    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Step 3: Load user from database
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    # Import here to avoid circular imports
    from app.models.user import User

    user = await db.get(User, user_id)

    # Step 4: Verify user exists and is active
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise credentials_exception

    # Step 5: Return authenticated user
    return user


# ── Optional User Dependency ──────────────────────────────────
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

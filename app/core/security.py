"""
DocuMind - core/security.py
Purpose : JWT creation/decoding, password hashing, refresh token utils
Phase   : 1 — Foundation
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
import bcrypt

# Workaround for passlib 1.7.4 compatibility with bcrypt 4.x
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("bcrypt_about", (), {"__version__": bcrypt.__version__})

from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()

# ── Password Hashing ──────────────────────────────────────────
# bcrypt is the industry standard for password hashing
# deprecated="auto" → automatically upgrades old hash schemes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    Returns a string like: $2b$12$... (60 chars)
    NEVER store plain text passwords.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare plain text password against stored bcrypt hash.
    Returns True if match, False if not.
    Used in login flow.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ── Access Token ──────────────────────────────────────────────
def create_access_token(user_id: str) -> str:
    """
    Create a JWT access token for a user.

    Payload:
      sub  → user ID as string (subject)
      exp  → expiry timestamp (configurable, default 15 min)
      iat  → issued-at timestamp
      type → 'access' (prevents refresh tokens being used as access)

    Signed with SECRET_KEY using HS256 algorithm.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": str(user_id),   # MUST be string
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


# ── Token Decoding ────────────────────────────────────────────
def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Raises JWTError if:
      - Token is invalid or tampered
      - Token has expired
      - Token is not an access token (type != 'access')

    Returns payload dict with 'sub' = user_id string
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        # Extra check: prevent refresh tokens being used as access tokens
        if payload.get("type") != "access":
            raise JWTError("Invalid token type")
        return payload
    except JWTError:
        raise


# ── Refresh Token ─────────────────────────────────────────────
def create_refresh_token() -> tuple[str, str]:
    """
    Create a refresh token pair.

    Returns: (raw_token, sha256_hash)

    - raw_token   → sent to the user (store in their browser/app)
    - sha256_hash → stored in database (NEVER store raw token in DB)

    Why hash it?
    If DB is compromised → attacker gets hashes, not real tokens.
    They cannot use a hash to refresh — they need the raw token.
    """
    raw = secrets.token_urlsafe(64)   # 64-byte cryptographically random
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, token_hash


def hash_refresh_token(raw_token: str) -> str:
    """
    Hash a raw refresh token for DB lookup.
    Used when user sends refresh token → hash it → find in DB.
    """
    return hashlib.sha256(raw_token.encode()).hexdigest()

"""
DocuMind - schemas/auth.py
Purpose : Pydantic v2 schemas for auth endpoints (register, login, tokens)
Phase   : 2
"""
import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_config

_ALPHANUM_RE = re.compile(r"^[a-zA-Z0-9_]+$")


# ─────────────────────────── Request Schemas ─────────────────────

class RegisterRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

    email: EmailStr = Field(..., description="Valid e-mail address")
    username: str = Field(
        ..., min_length=3, max_length=50, description="3–50 alphanumeric/underscore chars"
    )
    password: str = Field(..., min_length=8, description="At least 8 characters")

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not _ALPHANUM_RE.match(v):
            raise ValueError(
                "username may only contain letters, digits, and underscores"
            )
        return v

    @field_validator("password")
    @classmethod
    def password_min_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

    email: EmailStr = Field(..., description="Registered e-mail address")
    password: str = Field(..., description="Account password")


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="Opaque refresh token issued at login")


# ─────────────────────────── Response Schemas ────────────────────

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = model_config(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    is_active: bool
    created_at: datetime

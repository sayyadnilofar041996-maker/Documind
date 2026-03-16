"""
DocuMind - schemas/common.py
Purpose : Shared Pydantic schemas — pagination, RFC 7807 errors, health
Phase   : 1 — Foundation
"""

from pydantic import BaseModel, ConfigDict, field_validator
from typing import Generic, TypeVar, List

T = TypeVar("T")


# ── Pagination ────────────────────────────────────────────────
class PaginationParams(BaseModel):
    """
    Reusable pagination parameters.
    Used in: GET /documents/, GET /query/sessions, GET /documents/{id}/chunks
    """
    page: int = 1
    page_size: int = 20

    @field_validator("page")
    @classmethod
    def page_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("page must be >= 1")
        return v

    @field_validator("page_size")
    @classmethod
    def page_size_must_be_valid(cls, v: int) -> int:
        if v < 1:
            raise ValueError("page_size must be >= 1")
        if v > 100:
            raise ValueError("page_size must be <= 100")
        return v


# ── RFC 7807 Error Response ───────────────────────────────────
class ErrorResponse(BaseModel):
    """
    Standard Problem Details error response (RFC 7807).
    All API errors return this format.
    
    Example:
    {
        "type": "https://documind.io/errors/404",
        "title": "Document Not Found",
        "status": 404,
        "detail": "Document abc-123 does not exist",
        "instance": "/api/v1/documents/abc-123"
    }
    """
    type: str
    title: str
    status: int
    detail: str
    instance: str


# ── Health Response ───────────────────────────────────────────
class HealthResponse(BaseModel):
    """Response schema for GET /health endpoint."""
    status: str
    app: str
    version: str
    debug: bool


class ReadinessResponse(BaseModel):
    """Response schema for GET /health/ready endpoint."""
    status: str
    db: str
    redis: str
    embedding_model: str


# ── Generic List Response ─────────────────────────────────────
class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic wrapper for paginated list responses.
    
    Usage:
      return PaginatedResponse(
          items=documents,
          total=100,
          page=1,
          page_size=20,
      )
    """
    model_config = ConfigDict(from_attributes=True)

    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int = 0

    def model_post_init(self, __context) -> None:
        """Calculate total pages after initialization."""
        if self.page_size > 0:
            import math
            self.pages = math.ceil(self.total / self.page_size)

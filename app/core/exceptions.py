"""
DocuMind - core/exceptions.py
Purpose : Custom application exceptions and RFC 7807 handlers
"""
from fastapi import Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi.errors import RateLimitExceeded
import structlog
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()

# ── Custom Exceptions ─────────────────────────────────────────

class DocuMindError(Exception):
    """Base class for DocuMind exceptions."""
    pass

class AuthenticationError(DocuMindError):
    """Raised when authentication fails."""
    pass

class AuthorizationError(DocuMindError):
    """Raised when user lacks permission."""
    pass

class DocumentError(DocuMindError):
    """Raised when document processing fails."""
    pass

class FileTooLargeError(DocumentError):
    """Raised when file exceeds size limits."""
    pass

class UnsupportedFileTypeError(DocumentError):
    """Raised when file type is not supported."""
    pass

# ── RFC 7807 Factory ──────────────────────────────────────────

def rfc7807_response(
    request: Request,
    status_code: int,
    title: str,
    detail: str,
) -> JSONResponse:
    """Build RFC 7807 Problem Details response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "type": f"https://documind.io/errors/{status_code}",
            "title": title,
            "status": status_code,
            "detail": detail,
            "instance": str(request.url),
        },
    )

# ── Handlers ──────────────────────────────────────────────────

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle standard FastAPI HTTPExceptions."""
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
        
    return rfc7807_response(
        request=request,
        status_code=exc.status_code,
        title="HTTP Error",
        detail=str(exc.detail)
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "type": "https://documind.io/errors/422",
            "title": "Validation Error",
            "status": 422,
            "detail": exc.errors(),
            "instance": str(request.url),
        }
    )

async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded (429)."""
    logger.warning("rate_limit.exceeded", path=str(request.url), limit=str(exc.detail))
    return rfc7807_response(
        request=request,
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        title="Rate Limit Exceeded",
        detail=f"Too many requests. Limit: {exc.detail}"
    )

async def unhandled_exception_handler(request: Request, exc: Exception):
    """Global fallback for unexpected errors."""
    logger.exception("unhandled_error", error=str(exc), path=str(request.url))
    return rfc7807_response(
        request=request,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        title="Internal Server Error",
        detail=str(exc) if settings.debug else "An internal server error occurred."
    )

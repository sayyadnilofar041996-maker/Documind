"""
DocuMind - core/error_handlers.py
Purpose : RFC 7807 error handlers + rate limit handler
Phase   : 5 — Async Processing & Observability
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi.errors import RateLimitExceeded
import structlog

from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


def rfc7807_response(
    request: Request,
    status_code: int,
    title: str,
    detail: str,
) -> JSONResponse:
    """
    Build RFC 7807 Problem Details response.
    Standard format for ALL DocuMind errors.
    """
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


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """Handle all HTTP exceptions (401, 403, 404, etc.)"""
    # If detail is already a dict (e.g. from _problem factory), return it directly
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail,
        )
        
    return rfc7807_response(
        request=request,
        status_code=exc.status_code,
        title="Error occurred",
        detail=str(exc.detail),
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Handle Pydantic validation errors (422)"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "type": "https://documind.io/errors/422",
            "title": "Validation Error",
            "status": 422,
            "detail": exc.errors(),
            "instance": str(request.url),
        },
    )


async def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded,
) -> JSONResponse:
    """Handle rate limit exceeded (429)"""
    logger.warning(
        "rate_limit.exceeded",
        path=str(request.url),
        limit=str(exc.detail),
    )
    return rfc7807_response(
        request=request,
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        title="Rate Limit Exceeded",
        detail=f"Too many requests. Limit: {exc.detail}",
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Handle all unhandled exceptions (500).
    In production: sanitized message (no stack trace).
    In debug: full error message.
    """
    logger.error(
        "server.unhandled_exception",
        error=str(exc),
        error_type=type(exc).__name__,
        path=str(request.url),
    )
    return rfc7807_response(
        request=request,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        title="Internal Server Error",
        detail=str(exc) if settings.debug
               else "An unexpected error occurred.",
    )

"""
DocuMind - main.py
Purpose : FastAPI application factory with lifespan events
Phase   : 1 — Foundation
"""
import uuid
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app
from starlette.exceptions import HTTPException as StarletteHTTPException
import structlog

from app.config import get_settings
from app.core.database import init_db
from app.core import metrics

settings = get_settings()
logger = structlog.get_logger()


# ── Structlog Configuration ───────────────────────────────────
def configure_logging() -> None:
    """Configure structlog for JSON structured logging in prod, pretty in debug."""
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]
    if settings.debug:
        processors.append(structlog.dev.ConsoleRenderer())
    else:
        processors.append(structlog.processors.JSONRenderer())

    structlog.configure(processors=processors)


# ── Lifespan ──────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan manager.
    Startup: configure logging, init DB, pre-warm embedding model.
    Shutdown: clean up resources.
    """
    # ── Startup ──────────────────────────────────────────
    configure_logging()
    logger.info("documind.starting", version=settings.app_version)

    # Initialize database + create tables
    await init_db()
    logger.info("documind.database_ready")

    # Pre-warm HuggingFace embedding model
    # Loads 80MB model into memory NOW instead of on first request
    # Avoids 10-second cold start on first user query
    try:
        from app.pipeline.embedder import get_embedder
        get_embedder()
        logger.info(
            "documind.embedder_ready",
            model=settings.embedding_model,
            device=settings.embedding_device,
        )
    except Exception as e:
        logger.warning("documind.embedder_warmup_failed", error=str(e))

    logger.info("documind.started")
    yield

    # ── Shutdown ─────────────────────────────────────────
    logger.info("documind.shutting_down")


# ── App Factory ───────────────────────────────────────────────
def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        description="AI-powered document intelligence platform",
        version=settings.app_version,
        debug=settings.debug,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────
    # CORS — allow origins based on environment
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.debug else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID middleware
    # Adds unique X-Request-ID header to every response for tracing
    class RequestIDMiddleware:
        def __init__(self, app):
            self.app = app

        async def __call__(self, scope, receive, send):
            if scope["type"] != "http":
                return await self.app(scope, receive, send)

            request_id = str(uuid.uuid4())
            structlog.contextvars.bind_contextvars(request_id=request_id)

            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    headers.append((b"X-Request-ID", request_id.encode()))
                    message["headers"] = headers
                await send(message)

            try:
                await self.app(scope, receive, send_wrapper)
            finally:
                structlog.contextvars.clear_contextvars()

    app.add_middleware(RequestIDMiddleware)

    @app.middleware("http")
    async def prometheus_metrics_middleware(request: Request, call_next):
        if request.url.path == "/metrics":
            return await call_next(request)
            
        start_time = time.perf_counter()
        status_code = 500
        
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration = time.perf_counter() - start_time
            
            # Using route.path to avoid high cardinality (UUIDs in URLs)
            route = request.scope.get("route")
            endpoint = route.path if route else request.url.path
            
            metrics.http_requests_total.labels(
                method=request.method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()
            
            metrics.http_request_duration_seconds.labels(
                method=request.method,
                endpoint=endpoint
            ).observe(duration)

    # ── Exception Handlers (RFC 7807) ──────────────────────
    # All errors return standard Problem Details format:
    # {type, title, status, detail, instance}

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        # If the detail is already an RFC 7807 dict, pass it through
        if isinstance(exc.detail, dict):
            content = exc.detail
        else:
            content = {
                "type": f"https://documind.io/errors/{exc.status_code}",
                "title": str(exc.detail),
                "status": exc.status_code,
                "detail": str(exc.detail),
                "instance": str(request.url),
            }
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
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

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        logger.error(
            "documind.unhandled_exception",
            error=str(exc),
            path=str(request.url),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "type": "https://documind.io/errors/500",
                "title": "Internal Server Error",
                "status": 500,
                "detail": str(exc) if settings.debug else "An unexpected error occurred.",
                "instance": str(request.url),
            },
        )

    # ── Routers ───────────────────────────────────────────
    # Import inside factory to avoid circular imports at module level
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api/v1")

    # ── Prometheus Metrics ────────────────────────────────
    # Mounts Prometheus metrics endpoint at /metrics
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)

    return app


# ── App Instance ──────────────────────────────────────────────
# This is what uvicorn runs:
# uvicorn app.main:app --host 0.0.0.0 --port 8000
app = create_app()

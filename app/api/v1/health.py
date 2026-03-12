"""
DocuMind - api/v1/health.py
Purpose : Health check endpoints — liveness, readiness, version
Phase   : 1 — Foundation
"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
import structlog

from app.core.database import AsyncSessionLocal
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()

router = APIRouter(tags=["Health"])


# ── GET /health ───────────────────────────────────────────────
@router.get("/health")
async def health():
    """
    Basic health check.
    Returns app name, version, status.
    Always returns 200 if app is running.
    """
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug,
    }


# ── GET /health/live ──────────────────────────────────────────
@router.get("/health/live")
async def liveness():
    """
    Kubernetes liveness probe.
    Always returns 200 as long as the process is running.
    If this fails → Kubernetes restarts the container.
    """
    return {"status": "alive"}


# ── GET /health/ready ─────────────────────────────────────────
@router.get("/health/ready")
async def readiness():
    """
    Kubernetes readiness probe.
    Checks ALL dependencies before returning healthy.
    Returns 503 if any dependency is down.
    
    Checks:
      - PostgreSQL: runs SELECT 1
      - Redis: runs PING
      - Embedding model: checks if loaded in memory
    """
    checks = {
        "db": "error",
        "redis": "error",
        "embedding_model": "error",
    }
    all_healthy = True

    # ── Check PostgreSQL ──────────────────────────────────
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        checks["db"] = "ok"
    except Exception as e:
        logger.error("health.db_check_failed", error=str(e))
        all_healthy = False

    # ── Check Redis ───────────────────────────────────────
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as e:
        logger.error("health.redis_check_failed", error=str(e))
        all_healthy = False

    # ── Check Embedding Model ─────────────────────────────
    try:
        from app.pipeline.embedder import get_embedder
        embedder = get_embedder()
        if embedder is not None:
            checks["embedding_model"] = "loaded"
        else:
            all_healthy = False
    except Exception as e:
        logger.error("health.embedder_check_failed", error=str(e))
        all_healthy = False

    # ── Return Result ─────────────────────────────────────
    http_status = (
        status.HTTP_200_OK
        if all_healthy
        else status.HTTP_503_SERVICE_UNAVAILABLE
    )

    return JSONResponse(
        status_code=http_status,
        content={
            "status": "healthy" if all_healthy else "unhealthy",
            **checks,
        },
    )

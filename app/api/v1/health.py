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
    Checks DB, Redis, and Embedding Model.
    """
    checks = {
        "db": "down",
        "redis": "down",
        "embedding_model": "not_loaded",
    }
    all_healthy = True

    # 1. DB Check
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        checks["db"] = "up"
    except Exception as e:
        logger.error("health.db_failure", error=str(e))
        all_healthy = False

    # 2. Redis Check with Timeout
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url, socket_timeout=2)
        await r.ping()
        await r.aclose()
        checks["redis"] = "up"
    except Exception as e:
        logger.error("health.redis_failure", error=str(e))
        all_healthy = False

    # 3. Embedding Model Check
    try:
        from app.pipeline.embedder import get_embedder
        # Checking if the function is cached and has content
        if get_embedder.cache_info().currsize > 0:
            checks["embedding_model"] = "up"
        else:
            # Try to trigger a load (warmup)
            get_embedder()
            checks["embedding_model"] = "up"
    except Exception as e:
        logger.error("health.embedder_failure", error=str(e))
        all_healthy = False

    return JSONResponse(
        status_code=status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"status": "healthy" if all_healthy else "unhealthy", "checks": checks}
    )

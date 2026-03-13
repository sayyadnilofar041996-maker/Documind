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
    """
    checks = {
        "db": "error",
        "redis": "error",
        "embedding_model": "error",
    }
    all_healthy = True

    # 1. Check PostgreSQL (SELECT 1)
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        checks["db"] = "ok"
    except Exception as e:
        logger.error("health.db_check_failed", error=str(e))
        all_healthy = False

    # 2. Check Redis (PING)
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as e:
        logger.error("health.redis_check_failed", error=str(e))
        all_healthy = False

    # 3. Check Embedding Model (Check lru_cache status)
    try:
        from app.pipeline.embedder import get_embedder
        # We check cache_info to see if it has been called successfully at least once
        # (Lifespan pre-warms it, so this should be > 0)
        cache_info = get_embedder.cache_info()
        if cache_info.currsize > 0:
            checks["embedding_model"] = "loaded"
        else:
            # If not in cache, the model isn't "loaded" yet (pre-warming failed or hasn't run)
            all_healthy = False
    except Exception as e:
        logger.error("health.embedder_check_failed", error=str(e))
        all_healthy = False

    # ── Response ──────────────────────────────────────────
    http_status = (
        status.HTTP_200_OK
        if all_healthy
        else status.HTTP_503_SERVICE_UNAVAILABLE
    )

    return JSONResponse(
        status_code=http_status,
        content=checks
    )

"""
DocuMind - api/v1/router.py
Purpose : Main v1 APIRouter — wires auth, documents, query, health sub-routers
Phase   : 1 — Foundation; extended in Phase 2
"""
from fastapi import APIRouter

# ── Main API Router ───────────────────────────────────────────
api_router = APIRouter()

# ── Auth (available at /api/v1/auth/...) ──────────────────────
try:
    from app.api.v1.auth import router as auth_router
    api_router.include_router(
        auth_router,
        prefix="/auth",
        tags=["Authentication"],
    )
except ImportError:
    pass  # auth router not implemented yet — skip silently

# ── Health (available at /api/v1/health) ──────────────────────
try:
    from app.api.v1.health import router as health_router
    api_router.include_router(
        health_router,
        prefix="",
        tags=["Health"],
    )
except ImportError:
    pass  # health router not implemented yet — skip silently

# ── Documents (available at /api/v1/documents/...) ────────────
try:
    from app.api.v1.documents import router as documents_router
    api_router.include_router(
        documents_router,
        prefix="/documents",
        tags=["Documents"],
    )
except ImportError:
    pass  # documents router not implemented yet — skip silently

# ── Query (available at /api/v1/query/...) ────────────────────
try:
    from app.api.v1.query import router as query_router
    api_router.include_router(
        query_router,
        prefix="/query",
        tags=["Query"],
    )
except ImportError:
    pass  # query router not implemented yet — skip silently

"""
DocuMind - api/v1/router.py
Purpose : Main v1 APIRouter — wires auth, documents, query, health
Phase   : 1 — Foundation
"""

from fastapi import APIRouter

# ── Import all routers ────────────────────────────────────────
from app.api.v1.health import router as health_router

# NOTE: auth, documents, query routers are imported here
# but their implementation is added in later phases:
# auth     → T-1.4 (teammate, Phase 1)
# documents → T-2.1 (you, Phase 2)
# query    → T-4.3 (you, Phase 4)
# We use placeholder routers for now so app starts without errors

# ── Main API Router ───────────────────────────────────────────
api_router = APIRouter()

# ── Health (no prefix — available at /health directly) ────────
api_router.include_router(
    health_router,
    prefix="",
    tags=["Health"],
)

# ── Auth (available at /api/v1/auth/...) ──────────────────────
from app.api.v1.auth import router as auth_router
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)

# ── Documents (available at /api/v1/documents/...) ────────────
from app.api.v1.documents import router as documents_router
api_router.include_router(
    documents_router,
    prefix="/documents",
    tags=["Documents"],
)

# ── Query (available at /api/v1/query/...) ────────────────────
from app.api.v1.query import router as query_router
api_router.include_router(
    query_router,
    prefix="/query",
    tags=["Query"],
)

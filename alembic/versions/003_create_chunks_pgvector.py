"""
DocuMind - alembic migration 003
Purpose : Create document_chunks with Vector(384) + HNSW index
Phase   : 4
"""
# ============================================================
# PLACEHOLDER — implementation added in Phase 4
# ============================================================
# IMPORTANT: must run CREATE EXTENSION IF NOT EXISTS vector first
# Creates:  document_chunks table
# Special:  embedding Vector(384) column
# Index:    HNSW using vector_cosine_ops (m=16, ef_construction=64)
# FK:       document_id → documents.id CASCADE DELETE
# FK:       user_id → users.id CASCADE DELETE
# ============================================================

revision = "003"
down_revision = "002"

def upgrade(): pass
def downgrade(): pass

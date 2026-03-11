"""
DocuMind - alembic migration 004
Purpose : Create query_sessions and query_messages tables
Phase   : 5
"""
# ============================================================
# PLACEHOLDER — implementation added in Phase 5
# ============================================================
# Creates: query_sessions, query_messages tables
# Special: source_chunks JSONB column in query_messages
# Enum:    message_role_enum (user|assistant)
# FK:      session_id → query_sessions.id CASCADE DELETE
# ============================================================

revision = "004"
down_revision = "003"

def upgrade(): pass
def downgrade(): pass

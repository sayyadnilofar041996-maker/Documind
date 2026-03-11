"""
DocuMind - alembic migration 005
Purpose : Create refresh_tokens table for JWT rotation
Phase   : 2
"""
# ============================================================
# PLACEHOLDER — implementation added in Phase 2
# ============================================================
# Creates: refresh_tokens table
# Index:   token_hash (unique, for fast lookup on refresh)
# FK:      user_id → users.id CASCADE DELETE
# ============================================================

revision = "005"
down_revision = "004"

def upgrade(): pass
def downgrade(): pass

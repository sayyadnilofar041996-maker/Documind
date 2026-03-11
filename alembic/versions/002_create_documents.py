"""
DocuMind - alembic migration 002
Purpose : Create documents table with FileType and DocumentStatus enums
Phase   : 1
"""
# ============================================================
# PLACEHOLDER — implementation added in Phase 1
# ============================================================
# Creates: documents table
# Enums:   file_type_enum, document_status_enum
# FK:      user_id → users.id CASCADE DELETE
# ============================================================

revision = "002"
down_revision = "001"

def upgrade(): pass
def downgrade(): pass

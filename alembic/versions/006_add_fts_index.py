"""
DocuMind - alembic migration 006
Purpose : Add Full-Text Search (FTS) column and GIN index to document_chunks
Phase   : 8 — AI Improvements
"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Add search_vector column as a GENERATED column for FTS
    # This automatically converts 'text' into a tsvector for English
    op.execute(
        "ALTER TABLE document_chunks ADD COLUMN search_vector tsvector "
        "GENERATED ALWAYS AS (to_tsvector('english', text)) STORED"
    )
    
    # 2. Add GIN index for fast keyword search
    op.execute(
        "CREATE INDEX idx_document_chunks_fts ON document_chunks USING GIN (search_vector)"
    )

def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_document_chunks_fts")
    op.execute("ALTER TABLE document_chunks DROP COLUMN IF EXISTS search_vector")

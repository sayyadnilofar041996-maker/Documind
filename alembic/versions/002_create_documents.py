"""
DocuMind - alembic migration 002
Purpose : Create documents table with FileType and DocumentStatus enums
Phase   : 1
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002"
down_revision = "001"

def upgrade():
    file_type_enum = postgresql.ENUM('pdf', 'docx', 'py', 'js', 'ts', 'md', name='filetype')
    file_type_enum.create(op.get_bind())
    
    document_status_enum = postgresql.ENUM('pending', 'processing', 'ready', 'failed', name='documentstatus')
    document_status_enum.create(op.get_bind())

    op.create_table(
        'documents',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('stored_filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', file_type_enum, nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('file_sha256', sa.String(length=64), nullable=False),
        sa.Column('status', document_status_enum, nullable=False, server_default='pending'),
        sa.Column('chunk_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('celery_task_id', sa.String(length=255), nullable=True),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('documents')
    postgresql.ENUM('pdf', 'docx', 'py', 'js', 'ts', 'md', name='filetype').drop(op.get_bind())
    postgresql.ENUM('pending', 'processing', 'ready', 'failed', name='documentstatus').drop(op.get_bind())

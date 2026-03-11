"""
DocuMind - worker/tasks/embed_task.py
Purpose : Celery task — embed chunks with HuggingFace, store vectors
Phase   : 6
"""
# ============================================================
# PLACEHOLDER — implementation added in Phase 6
# ============================================================
# Task: embed_chunks(document_id: str)
# 1. Load all chunks WHERE embedding IS NULL
# 2. embed_texts(chunk_texts) → 384-dim vectors
# 3. Bulk update chunks with embeddings
# 4. Set document.status = "ready", chunk_count = N
# 5. On exception → status="failed"
# Note: uses sync DB session (not asyncpg) inside Celery
# ============================================================

pass

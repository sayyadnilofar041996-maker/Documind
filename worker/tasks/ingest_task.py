"""
DocuMind - worker/tasks/ingest_task.py
Purpose : Celery task — parse document into chunks, store in DB
Phase   : 6
"""
# ============================================================
# PLACEHOLDER — implementation added in Phase 6
# ============================================================
# Task: process_document(document_id: str)
# 1. Set document.status = "processing"
# 2. Detect file_type → call correct parser
# 3. chunk_pages(parsed_pages) → list[ParsedChunk]
# 4. Save chunks to DB (embedding=NULL at this stage)
# 5. Chain to embed_task.embed_chunks(document_id)
# 6. On exception → status="failed", store error_message
# Retry: max_retries=3, default_retry_delay=60s
# ============================================================

pass

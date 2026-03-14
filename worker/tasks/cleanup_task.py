"""
DocuMind - worker/tasks/cleanup_task.py
Purpose: Scheduled Celery task to clean up failed documents and orphaned files.
Phase: 5 - Celery Beat & Cleanup
"""

import os
import time
from datetime import datetime, timedelta
from sqlalchemy import select
import structlog

from worker.celery_app import app, SessionLocal
from app.models.document import Document, DocumentStatus
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


@app.task(name="cleanup_failed_documents")
def cleanup_failed_documents():
    """
    Celery task to perform routine system cleanup.
    
    Operations:
    1. Database & File Cleanup: Finds documents that have been in FAILED
       status for more than 7 days. Deletes their physical files from disk,
       then deletes the database records.
    2. Orphaned File Cleanup: Scans the upload directory for files that 
       do not have a corresponding record in the database and deletes them.
    """
    logger.info("cleanup_task.started")
    start_time = time.perf_counter()
    
    docs_deleted_count = 0
    orphans_deleted_count = 0
    deleted_db_filenames = set()

    with SessionLocal() as db:
        # --- 1. Cleanup Failed Documents ---
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        stmt = (
            select(Document)
            .where(Document.status == DocumentStatus.FAILED)
            .where(Document.updated_at < seven_days_ago)
        )
        
        failed_docs = db.execute(stmt).scalars().all()
        
        for doc in failed_docs:
            if doc.stored_filename:
                file_path = os.path.join(settings.upload_dir, doc.stored_filename)
                
                # Delete physical file
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        logger.debug("cleanup_task.file_deleted", file_path=file_path)
                    except Exception as e:
                        logger.warning("cleanup_task.file_delete_error", file_path=file_path, error=str(e))
                
                deleted_db_filenames.add(doc.stored_filename)
            
            # Delete DB record
            db.delete(doc)
            docs_deleted_count += 1
            
        # Commit the database deletions
        if docs_deleted_count > 0:
            db.commit()
            
        # --- 2. Cleanup Orphaned Files ---
        # Get all valid stored_filenames currently in the database
        valid_docs_stmt = select(Document.stored_filename).where(Document.stored_filename.is_not(None))
        valid_filenames = set(db.execute(valid_docs_stmt).scalars().all())
        
        if os.path.exists(settings.upload_dir):
            for filename in os.listdir(settings.upload_dir):
                file_path = os.path.join(settings.upload_dir, filename)
                
                # Skip directories and files we just deleted from the DB
                if not os.path.isfile(file_path) or filename in deleted_db_filenames:
                    continue
                    
                # If file is not in database, it's an orphan
                if filename not in valid_filenames:
                    try:
                        os.remove(file_path)
                        orphans_deleted_count += 1
                        logger.debug("cleanup_task.orphan_deleted", file_path=file_path)
                    except Exception as e:
                        logger.warning("cleanup_task.orphan_delete_error", file_path=file_path, error=str(e))

    duration_ms = int((time.perf_counter() - start_time) * 1000)
    
    logger.info(
        "cleanup_task.completed",
        docs_deleted=docs_deleted_count,
        orphans_deleted=orphans_deleted_count,
        duration_ms=duration_ms
    )
    
    return {
        "docs_deleted": docs_deleted_count,
        "orphans_deleted": orphans_deleted_count,
        "duration_ms": duration_ms
    }

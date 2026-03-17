"""
DocuMind - services/document_service.py
Purpose : Document business logic — orchestration between DB and UploadService
"""
import uuid
import structlog
from typing import List, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from celery.result import AsyncResult

from app.config import get_settings
from app.models.document import Document, DocumentStatus
from app.models.chunk import DocumentChunk
from app.services.upload_service import UploadService
from app.core.exceptions import DocumentError
from worker.celery_app import app as celery_app
from worker.tasks.ingest_task import ingest_task

settings = get_settings()
logger = structlog.get_logger()
upload_service = UploadService()

class DocumentService:
    """
    Handles higher-level business logic for documents.
    Delegates file-level operations to UploadService.
    """

    async def upload_document(
        self, 
        db: AsyncSession, 
        file: any, # UploadFile
        user_id: uuid.UUID
    ) -> Document:
        """
        Full upload pipeline:
        1. Validate via UploadService
        2. Hash & deduplicate
        3. Save to disk via UploadService
        4. Create DB record
        5. Dispatch Celery task
        """
        # 1. Validation
        file_type, ext = await upload_service.validate_file(file)
        
        # 2. Hashing & Deduplication
        file_hash = await upload_service.compute_hash(file)
        stmt = select(Document).where(
            Document.user_id == user_id,
            Document.file_sha256 == file_hash
        )
        existing = await db.execute(stmt)
        if existing.scalar_one_or_none():
            raise DocumentError("You have already uploaded this document.")

        # 3. Secure Naming & Storage
        stored_filename = await upload_service.get_secure_filename(file.filename, ext)
        file_size = await upload_service.save_to_disk(file, stored_filename)

        # 4. DB Record
        doc = Document(
            user_id=user_id,
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_type=file_type,
            file_size_bytes=file_size,
            file_sha256=file_hash,
            status=DocumentStatus.PENDING
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        
        # 5. Background Task
        task = ingest_task.delay(str(doc.id))
        
        doc.celery_task_id = task.id
        doc.status = DocumentStatus.PROCESSING
        await db.commit()
        await db.refresh(doc)

        logger.info("document.ingestion_dispatched", doc_id=str(doc.id), task_id=task.id)
        return doc

    async def delete_document(
        self, 
        db: AsyncSession, 
        doc_id: uuid.UUID, 
        user_id: uuid.UUID
    ) -> None:
        """Deletes document record and associated file from disk."""
        doc = await self.get_document(db, doc_id, user_id)
        await upload_service.delete_file(doc.stored_filename)
        await db.delete(doc)
        await db.commit()
        logger.info("document.deleted", doc_id=str(doc_id), user_id=str(user_id))

    async def get_document(self, db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID) -> Document:
        """Retrieves a document and verifies ownership."""
        stmt = select(Document).where(Document.id == doc_id, Document.user_id == user_id)
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()
        if not doc:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        return doc

    async def list_documents(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        page: int = 1,
        page_size: int = 20,
        status_filter: DocumentStatus | None = None
    ) -> Tuple[List[Document], int]:
        """Paginated list of user documents."""
        offset = (page - 1) * page_size
        stmt = select(Document).where(Document.user_id == user_id)
        if status_filter:
            stmt = stmt.where(Document.status == status_filter)
        stmt = stmt.order_by(Document.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        docs = list(result.scalars().all())
        
        count_stmt = select(func.count(Document.id)).where(Document.user_id == user_id)
        if status_filter:
            count_stmt = count_stmt.where(Document.status == status_filter)
        count_result = await db.execute(count_stmt)
        total = count_result.scalar() or 0
        return docs, total

    async def get_document_chunks(
        self,
        db: AsyncSession,
        doc_id: uuid.UUID,
        user_id: uuid.UUID,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[DocumentChunk], int]:
        """Retrieves chunks for a document."""
        await self.get_document(db, doc_id, user_id)
        offset = (page - 1) * page_size
        stmt = select(DocumentChunk).where(DocumentChunk.document_id == doc_id).order_by(DocumentChunk.chunk_index).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        chunks = list(result.scalars().all())
        
        count_stmt = select(func.count(DocumentChunk.id)).where(DocumentChunk.document_id == doc_id)
        count_result = await db.execute(count_stmt)
        total = count_result.scalar() or 0
        return chunks, total

    async def get_enhanced_status(self, db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID) -> dict:
        """Fetches status and merges with live Celery state."""
        doc = await self.get_document(db, doc_id, user_id)
        celery_state = None
        if doc.celery_task_id:
            res = AsyncResult(doc.celery_task_id, app=celery_app)
            celery_state = res.state
            
        progress_pct = 0.0
        if doc.status == DocumentStatus.READY:
            progress_pct = 100.0
        elif doc.status == DocumentStatus.PROCESSING:
            progress_pct = 50.0
            
        # Ensure updated_at is loaded before returning dict
        updated_at = doc.updated_at
            
        return {
            "id": doc.id,
            "status": doc.status,
            "chunk_count": doc.chunk_count,
            "celery_state": celery_state,
            "error_message": doc.error_message,
            "progress_pct": progress_pct,
            "updated_at": doc.updated_at
        }

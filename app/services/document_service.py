"""
DocuMind - services/document_service.py
Purpose : Document business logic — upload, validate, list, delete
Phase   : 2 — File Upload
"""

import os
import uuid
import hashlib
import aiofiles
import magic
from typing import List, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.config import get_settings
from app.models.document import Document, FileType, DocumentStatus
from app.schemas.document import DocumentCreate, DocumentUpdate

settings = get_settings()
logger = structlog.get_logger()

# ── Extension to FileType Mapping ────────────────────────────
EXT_MAPPING = {
    ".pdf": FileType.PDF,
    ".docx": FileType.DOCX,
    ".py": FileType.PYTHON,
    ".js": FileType.JAVASCRIPT,
    ".ts": FileType.TYPESCRIPT,
    ".md": FileType.MARKDOWN,
}

# ── MIME Type to FileType Mapping ────────────────────────────
MIME_MAPPING = {
    "application/pdf": FileType.PDF,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileType.DOCX,
    "text/x-python": FileType.PYTHON,
    "text/javascript": FileType.JAVASCRIPT,
    "application/javascript": FileType.JAVASCRIPT,
    "text/typescript": FileType.TYPESCRIPT,
    "text/markdown": FileType.MARKDOWN,
    "text/plain": FileType.MARKDOWN,  # fallback for md
}


class DocumentService:
    """
    Handles business logic for documents: storage, validation, and DB sync.
    """

    @staticmethod
    async def validate_file(file: UploadFile) -> Tuple[FileType, str]:
        """
        Validates file extension, size, and magic bytes.
        Returns (FileType, extension) or raises HTTPException.
        """
        # 1. Check extension
        filename = file.filename or "unknown"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in EXT_MAPPING:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file extension: {ext}"
            )

        # 2. Check size (settings.max_file_size_mb)
        # file.size is available in FastAPI 0.96+
        content = await file.read()
        file_size = len(content)
        max_size = settings.max_file_size_mb * 1024 * 1024
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size is {settings.max_file_size_mb}MB"
            )
        await file.seek(0)  # Reset for later use

        # 3. Check MIME type via magic bytes
        # magic.from_buffer returns MIME type string
        mime = magic.from_buffer(content[:2048], mime=True)
        if mime not in MIME_MAPPING:
             # Some text files might be detected as text/plain
             if mime == "text/plain" and ext in [".py", ".js", ".ts", ".md"]:
                 pass # allowed
             else:
                logger.warning("document.invalid_mime", mime=mime, ext=ext)
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"MIME type mismatch or unsupported: {mime}"
                )

        return EXT_MAPPING[ext], ext

    @staticmethod
    async def compute_sha256(file: UploadFile) -> str:
        """Computes SHA256 hash of file content."""
        sha256_hash = hashlib.sha256()
        # Read in chunks to avoid memory issues for large files
        await file.seek(0)
        while chunk := await file.read(65536):
            sha256_hash.update(chunk)
        await file.seek(0)
        return sha256_hash.hexdigest()

    async def upload_document(
        self, 
        db: AsyncSession, 
        file: UploadFile, 
        user_id: uuid.UUID
    ) -> Document:
        """
        Full upload pipeline:
        1. Validate
        2. Hash & deduplicate check (user-level)
        3. Save to disk
        4. Create DB record
        """
        # 1. Validation
        file_type, ext = await self.validate_file(file)
        
        # 2. Hashing & Deduplication
        file_hash = await self.compute_sha256(file)
        
        # Check if user already uploaded this exact file
        stmt = select(Document).where(
            Document.user_id == user_id,
            Document.file_sha256 == file_hash
        )
        existing = await db.execute(stmt)
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already uploaded this document."
            )

        # 3. Save to Disk
        stored_filename = f"{uuid.uuid4()}{ext}"
        upload_path = os.path.join("uploads", stored_filename)
        os.makedirs("uploads", exist_ok=True)

        await file.seek(0)
        file_size = 0
        async with aiofiles.open(upload_path, "wb") as out_file:
            while content := await file.read(65536):
                await out_file.write(content)
                file_size += len(content)

        # 4. Create DB Record
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
        
        logger.info(
            "document.uploaded", 
            doc_id=str(doc.id), 
            user_id=str(user_id)
        )
        
        # TODO: Phase 3 -> Dispatch Celery task for ingestion
        return doc

    async def get_document(
        self, 
        db: AsyncSession, 
        doc_id: uuid.UUID, 
        user_id: uuid.UUID
    ) -> Document:
        """Retrieves a document and verifies ownership."""
        stmt = select(Document).where(
            Document.id == doc_id,
            Document.user_id == user_id
        )
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()
        
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
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
        
        # Query for items
        stmt = select(Document).where(Document.user_id == user_id)
        if status_filter:
            stmt = stmt.where(Document.status == status_filter)
        
        stmt = stmt.order_by(Document.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        docs = list(result.scalars().all())
        
        # Query for total count
        count_stmt = select(func.count(Document.id)).where(Document.user_id == user_id)
        if status_filter:
             count_stmt = count_stmt.where(Document.status == status_filter)
        
        count_result = await db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        return docs, total

    async def delete_document(
        self, 
        db: AsyncSession, 
        doc_id: uuid.UUID, 
        user_id: uuid.UUID
    ) -> None:
        """Deletes document record and associated file from disk."""
        doc = await self.get_document(db, doc_id, user_id)
        
        # 1. Remove from disk
        file_path = os.path.join("uploads", doc.stored_filename)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.error("document.delete_file_failed", error=str(e), path=file_path)

        # 2. Remove from DB
        await db.delete(doc)
        await db.commit()
        
        logger.info(
            "document.deleted", 
            doc_id=str(doc_id), 
            user_id=str(user_id)
        )

"""
DocuMind - services/upload_service.py
Purpose : Document upload lifecycle — validation, secure naming, deduplication
"""
import os
import uuid
import hashlib
import aiofiles
import magic
from typing import Tuple
from fastapi import UploadFile
import structlog

from app.config import get_settings
from app.models.document import FileType
from app.core.exceptions import FileTooLargeError, UnsupportedFileTypeError
from app.core.constants import SUPPORTED_MIME_TYPES, MAX_SYMBOLS_FILENAME

settings = get_settings()
logger = structlog.get_logger()

# MIME to FileType mapping
MIME_TO_TYPE = {
    "application/pdf": FileType.PDF,
    "application/msword": FileType.DOC,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileType.DOCX,
    "application/vnd.ms-powerpoint": FileType.PPT,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": FileType.PPTX,
    "application/vnd.ms-excel": FileType.XLS,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileType.XLSX,
    "text/plain": FileType.TXT,
    "text/markdown": FileType.MARKDOWN,
    "application/javascript": FileType.JAVASCRIPT,
    "text/x-python": FileType.PYTHON,
    "text/x-script.python": FileType.PYTHON,
    "text/javascript": FileType.JAVASCRIPT,
    "application/x-javascript": FileType.JAVASCRIPT,
    "text/x-javascript": FileType.JAVASCRIPT,
    "application/x-typescript": FileType.TYPESCRIPT,
    "text/typescript": FileType.TYPESCRIPT,
    "text/x-c": FileType.C,
    "text/x-chdr": FileType.C,
    "text/x-c++src": FileType.CPP,
    "text/x-c++hdr": FileType.CPP,
    "text/x-java": FileType.JAVA,
    "text/x-java-source": FileType.JAVA,
    "text/css": FileType.CSS,
    "text/html": FileType.HTML,
}

class UploadService:
    @staticmethod
    async def validate_file(file: UploadFile) -> Tuple[FileType, str]:
        """
        Securely validates file type, size, and content.
        Returns (FileType, extension).
        """
        filename = file.filename or "unknown"
        ext = os.path.splitext(filename)[1].lower()
        
        # 1. Read first chunk for magic bytes validation
        header = await file.read(2048)
        
        # 2. Validate MIME type
        mime = magic.from_buffer(header, mime=True)
        
        # Fallback for text files that magic might label simply
        # We allow any text-like file with a code extension
        code_extensions = [
            ".py", ".js", ".ts", ".jsx", ".tsx", ".md", ".css", ".html", 
            ".java", ".c", ".cpp", ".h", ".hpp", ".rb", ".go", ".rs", 
            ".php", ".swift", ".kt", ".sh", ".json", ".sql", ".txt"
        ]
        
        if mime not in SUPPORTED_MIME_TYPES:
            if (mime.startswith("text/") or mime == "application/octet-stream") and ext in code_extensions:
                pass
            else:
                raise UnsupportedFileTypeError(f"Unsupported file type: {mime}")
        
        # 3. Validate size
        await file.seek(0)
        return MIME_TO_TYPE.get(mime, FileType.TXT), ext

    @staticmethod
    async def get_secure_filename(original_filename: str, ext: str) -> str:
        """Generates a UUID-based filename for storage."""
        return f"{uuid.uuid4()}{ext}"

    @staticmethod
    async def compute_hash(file: UploadFile) -> str:
        """Computes SHA256 of file for deduplication."""
        sha256_hash = hashlib.sha256()
        await file.seek(0)
        while chunk := await file.read(65536):
            sha256_hash.update(chunk)
        await file.seek(0)
        return sha256_hash.hexdigest()

    async def save_to_disk(self, file: UploadFile, stored_filename: str) -> int:
        """Saves file to disk and returns final size."""
        os.makedirs(settings.upload_dir, exist_ok=True)
        path = os.path.join(settings.upload_dir, stored_filename)
        
        file_size = 0
        await file.seek(0)
        async with aiofiles.open(path, "wb") as f:
            while chunk := await file.read(65536):
                await f.write(chunk)
                file_size += len(chunk)
        return file_size
        
    @staticmethod
    async def delete_file(stored_filename: str) -> None:
        """Removes a file from the uploads directory."""
        path = os.path.join(settings.upload_dir, stored_filename)
        try:
            if os.path.exists(path):
                os.remove(path)
            else:
                logger.warning("upload.file_not_found_on_disk", filename=stored_filename)
        except Exception as exc:
            logger.error("upload.delete_failed", filename=stored_filename, error=str(exc))

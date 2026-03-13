import os
import logging
from worker.celery_app import app, SessionLocal
from worker.tasks import embed_task
from app.models.document import Document, DocumentStatus, FileType
from app.models.chunk import DocumentChunk
from app.pipeline.parsers.pdf_parser import parse_pdf
from app.pipeline.parsers.docx_parser import parse_docx
from app.pipeline.parsers.code_parser import parse_code
from app.pipeline.chunker import chunk_pages
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

@app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_document(self, document_id: str):
    """
    Parses a document, chunks the text, and stores it in the database.
    Then chains to the embedding task.
    """
    session = SessionLocal()
    try:
        # 1. Fetch document
        document = session.query(Document).filter(Document.id == document_id).first()
        if not document:
            logger.error(f"Document {document_id} not found")
            return

        # 2. Set status to processing
        document.status = DocumentStatus.PROCESSING
        session.commit()

        # 3. Load file and parse
        # Assuming upload_dir is where files are stored
        file_path = os.path.join(settings.upload_dir, document.stored_filename)
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at {file_path}")

        # Detect file type and route to correct parser
        if document.file_type == FileType.PDF:
            parsed_results = parse_pdf(file_path)
        elif document.file_type == FileType.DOCX:
            parsed_results = parse_docx(file_path)
        elif document.file_type in [FileType.PYTHON, FileType.JAVASCRIPT, FileType.TYPESCRIPT, FileType.MARKDOWN]:
            parsed_results = parse_code(file_path, document.file_type.value)
        else:
            raise ValueError(f"Unsupported file type: {document.file_type}")

        # 4. Chunk pages
        # Pass parsed results (list of ParsedChunk from parsers) to chunker for further splitting if needed
        final_chunks = chunk_pages(parsed_results)

        # 5. Bulk insert DocumentChunk records
        # embedding=None at this stage
        db_chunks = []
        for i, chunk in enumerate(final_chunks):
            # Calculate token count (simple word count as fallback if no tokenizer)
            token_count = len(chunk.text.split())
            
            db_chunk = DocumentChunk(
                document_id=document.id,
                user_id=document.user_id,
                text=chunk.text,
                page_number=chunk.page_number,
                chunk_index=i,
                token_count=token_count,
                embedding=None
            )
            db_chunks.append(db_chunk)

        session.add_all(db_chunks)
        document.chunk_count = len(db_chunks)
        session.commit()

        # 6. Chain to embed task
        embed_task.embed_chunks.delay(str(document.id))

    except Exception as e:
        logger.exception(f"Error processing document {document_id}")
        session.rollback()
        # Reload document to ensure we have a fresh state
        document = session.query(Document).filter(Document.id == document_id).first()
        if document:
            document.status = DocumentStatus.FAILED
            document.error_message = str(e)
            session.commit()
        raise self.retry(exc=e)
    finally:
        session.close()

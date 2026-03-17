import time
import structlog
from datetime import datetime
from worker.celery_app import app, SessionLocal
from app.models.document import Document, DocumentStatus
from app.models.chunk import DocumentChunk
from app.pipeline.embedder import embed_texts
from app.core.metrics import embedding_latency_seconds

logger = structlog.get_logger()

@app.task
def embed_chunks(document_id: str):
    """
    Generates embeddings for all chunks of a document and updates the database.
    """
    logger.info("embed.task_started", doc_id=document_id)
    session = SessionLocal()
    try:
        # 1. Load all chunks where embedding IS NULL
        chunks = (
            session.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .filter(DocumentChunk.embedding == None)
            .all()
        )

        if not chunks:
            logger.info("embed.task_complete", doc_id=document_id, chunk_count=0, note="No pending chunks")
            return

        # 2. Extract texts
        texts = [c.text for c in chunks]

        # 3. Embed texts and measure latency
        start_time = time.perf_counter()
        embeddings = embed_texts(texts)
        elapsed = time.perf_counter() - start_time
        
        logger.info("embed.vectors_created",
                    doc_id=document_id,
                    chunks=len(chunks),
                    latency_ms=round(elapsed * 1000))
        
        # Metrics are recorded inside embed_texts()

        # 4 & 5. Zip and Bulk Update
        # bulk_update_mappings needs a list of dicts with primary keys
        update_data = []
        for chunk, emb in zip(chunks, embeddings):
            update_data.append({
                "id": chunk.id,
                "embedding": emb
            })

        session.bulk_update_mappings(DocumentChunk, update_data)

        # 6. Update document status
        document = session.query(Document).filter(Document.id == document_id).first()
        if document:
            document.status = DocumentStatus.READY
            document.chunk_count = session.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).count()
            document.updated_at = datetime.utcnow()
        
        session.commit()
        
        logger.info("embed.task_complete",
                    doc_id=document_id,
                    chunk_count=len(chunks))

    except Exception as exc:
        logger.error("embed.task_failed",
                     doc_id=document_id,
                     error=str(exc))
        session.rollback()
        
        document = session.query(Document).filter(Document.id == document_id).first()
        if document:
            document.status = DocumentStatus.FAILED
            document.error_message = str(exc)
            session.commit()
        raise
    finally:
        session.close()

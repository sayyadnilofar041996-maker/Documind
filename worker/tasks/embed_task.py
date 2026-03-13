import time
import logging
from datetime import datetime
from worker.celery_app import app, SessionLocal
from app.models.document import Document, DocumentStatus
from app.models.chunk import DocumentChunk
from app.pipeline.embedder import embed_texts
from app.core.metrics import embedding_latency_seconds

logger = logging.getLogger(__name__)

@app.task
def embed_chunks(document_id: str):
    """
    Generates embeddings for all chunks of a document and updates the database.
    """
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
            logger.info(f"No pending chunks to embed for document {document_id}")
            return

        # 2. Extract texts
        texts = [c.text for c in chunks]

        # 3. Embed texts and measure latency
        start_time = time.perf_counter()
        embeddings = embed_texts(texts)
        elapsed = time.perf_counter() - start_time
        
        logger.info(f"Embedded {len(texts)} chunks for doc {document_id} in {elapsed:.2f}s")
        
        # Record metric
        embedding_latency_seconds.observe(elapsed)

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

    except Exception as e:
        logger.exception(f"Error embedding chunks for document {document_id}")
        session.rollback()
        
        document = session.query(Document).filter(Document.id == document_id).first()
        if document:
            document.status = DocumentStatus.FAILED
            document.error_message = str(e)
            session.commit()
        raise
    finally:
        session.close()

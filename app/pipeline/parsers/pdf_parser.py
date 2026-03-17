import fitz  # PyMuPDF
import structlog
from app.pipeline.parsers import ParsedChunk

logger = structlog.get_logger()


def parse_pdf(file_path: str) -> list[ParsedChunk]:
    """
    Parses a PDF file and extracts text into a list of ParsedChunk objects.
    
    Args:
        file_path (str): Path to the PDF file.
        
    Returns:
        list[ParsedChunk]: List of extracted chunks, one per non-blank page.
    """
    logger.info("parser.pdf_started", path=file_path)
    chunks = []
    chunk_index = 0
    
    # Open the PDF document
    try:
        doc = fitz.open(file_path)
    except Exception as e:
        logger.error("parser.pdf_open_failed", path=file_path, error=str(e))
        raise
    
    try:
        for page_num, page in enumerate(doc, start=1):
            # Extract text and strip whitespace
            text = page.get_text("text").strip()
            
            # Skip blank pages
            if not text:
                continue
            
            # Create ParsedChunk
            chunk = ParsedChunk(
                text=text,
                page_number=page_num,
                chunk_index=chunk_index
            )
            chunks.append(chunk)
            chunk_index += 1
            
        logger.info("parser.pdf_finished", path=file_path, chunks=len(chunks), pages=len(doc))
    except Exception as e:
        logger.error("parser.pdf_failed", path=file_path, error=str(e))
        raise
    finally:
        # Ensure the document is closed
        doc.close()
        
    return chunks

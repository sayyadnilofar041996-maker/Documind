import structlog
from docx import Document
from app.pipeline.parsers import ParsedChunk
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


def parse_docx(file_path: str) -> list[ParsedChunk]:
    """
    Parses a DOCX file and extracts text into logical pages.
    Since DOCX doesn't have strict pagination like PDF, we group 
    paragraphs into logical 'pages' of approximately N words.
    
    Args:
        file_path (str): Path to the .docx file.
        
    Returns:
        list[ParsedChunk]: List of extracted chunks.
    """
    logger.info("parser.docx_started", path=file_path)
    chunks = []
    current_paragraphs = []
    current_word_count = 0
    page_number = 1
    chunk_index = 0
    
    try:
        doc = Document(file_path)
        
        for para in doc.paragraphs:
            text = para.text.strip()
            
            # Skip empty paragraphs
            if not text:
                continue
                
            words = text.split()
            word_count = len(words)
            
            # If adding this paragraph exceeds the limit, flush current buffer
            if current_word_count + word_count > settings.docx_page_word_limit and current_paragraphs:
                chunk = ParsedChunk(
                    text="\n\n".join(current_paragraphs),
                    page_number=page_number,
                    chunk_index=chunk_index
                )
                chunks.append(chunk)
                
                # Reset for next 'page'
                current_paragraphs = []
                current_word_count = 0
                page_number += 1
                chunk_index += 1
                
            current_paragraphs.append(text)
            current_word_count += word_count
            
        # Flush remaining text
        if current_paragraphs:
            chunk = ParsedChunk(
                text="\n\n".join(current_paragraphs),
                page_number=page_number,
                chunk_index=chunk_index
            )
            chunks.append(chunk)
            
        logger.info("parser.docx_finished", path=file_path, chunks=len(chunks), word_limit=settings.docx_page_word_limit)
        return chunks

    except Exception as e:
        logger.error("parser.docx_failed", path=file_path, error=str(e))
        raise

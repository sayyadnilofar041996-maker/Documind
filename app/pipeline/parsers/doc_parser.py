import subprocess
import structlog
import re
from app.pipeline.parsers import ParsedChunk
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()

def parse_doc(file_path: str) -> list[ParsedChunk]:
    """
    Parses legacy .doc files using antiword via CLI.
    Creates chunks roughly based on page length.
    """
    logger.info("parser.doc_started", path=file_path)
    chunks = []
    
    try:
        result = subprocess.run(['antiword', file_path], capture_output=True, text=True, check=True)
        content = result.stdout
        
        raw_pages = content.split('\f')
        if len(raw_pages) <= 1:
            raw_pages = re.split(r'\n\s*\n\s*\n', content)
            
        page_number = 1
        chunk_index = 0
        current_paragraphs = []
        current_word_count = 0
        
        for raw_page in raw_pages:
            text = raw_page.strip()
            if not text:
                continue
                
            words = text.split()
            word_count = len(words)
            
            if current_word_count + word_count > settings.docx_page_word_limit and current_paragraphs:
                combined_text = f"--- [PAGE {page_number}] ---\n\n" + "\n\n".join(current_paragraphs)
                chunk = ParsedChunk(
                    text=combined_text,
                    page_number=page_number,
                    chunk_index=chunk_index
                )
                chunks.append(chunk)
                current_paragraphs = []
                current_word_count = 0
                page_number += 1
                chunk_index += 1
                
            current_paragraphs.append(text)
            current_word_count += word_count
            
        if current_paragraphs:
            combined_text = f"--- [PAGE {page_number}] ---\n\n" + "\n\n".join(current_paragraphs)
            chunk = ParsedChunk(
                text=combined_text,
                page_number=page_number,
                chunk_index=chunk_index
            )
            chunks.append(chunk)

        logger.info("parser.doc_finished", path=file_path, chunks=len(chunks))
        return chunks

    except subprocess.CalledProcessError as e:
        logger.error("parser.doc_failed", path=file_path, error=e.stderr.strip() if e.stderr else str(e))
        raise RuntimeError(f"Antiword failed: {e.stderr}")
    except FileNotFoundError:
         logger.error("parser.doc_failed", path=file_path, error="antiword is not installed on the system.")
         raise RuntimeError("System requirement 'antiword' is missing. Please install it.")
    except Exception as e:
        logger.error("parser.doc_failed", path=file_path, error=str(e))
        raise

import structlog
import pandas as pd
from app.pipeline.parsers import ParsedChunk

logger = structlog.get_logger()

def parse_excel(file_path: str) -> list[ParsedChunk]:
    """Parses Excel files and extracts sheets as CSV text."""
    logger.info("parser.excel_started", path=file_path)
    chunks = []
    
    try:
        xls = pd.read_excel(file_path, sheet_name=None)
        
        chunk_index = 0
        page_number = 1
        
        for sheet_name, df in xls.items():
            if not df.empty:
                content = f"--- [SHEET: {sheet_name}] ---\n\n{df.to_csv(index=False)}"
                
                chunk = ParsedChunk(
                    text=content,
                    page_number=page_number,
                    chunk_index=chunk_index
                )
                chunks.append(chunk)
                chunk_index += 1
                page_number += 1
                
        logger.info("parser.excel_finished", path=file_path, chunks=len(chunks))
        return chunks
    except Exception as e:
        logger.error("parser.excel_failed", path=file_path, error=str(e))
        raise

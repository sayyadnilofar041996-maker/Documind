"""
DocuMind - pipeline/parsers/pdf_parser.py
Purpose : PDF document parser using PyMuPDF (fitz).
"""
import fitz  # PyMuPDF
from app.pipeline.parsers import ParsedChunk


def parse_pdf(file_path: str) -> list[ParsedChunk]:
    """
    Parses a PDF file and extracts text into a list of ParsedChunk objects.
    
    Args:
        file_path (str): Path to the PDF file.
        
    Returns:
        list[ParsedChunk]: List of extracted chunks, one per non-blank page.
    """
    chunks = []
    chunk_index = 0
    
    # Open the PDF document
    doc = fitz.open(file_path)
    
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
            
    finally:
        # Ensure the document is closed
        doc.close()
        
    return chunks

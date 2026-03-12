"""
DocuMind - pipeline/parsers/docx_parser.py
Purpose : DOCX document parser using python-docx.
"""
from docx import Document
from app.pipeline.parsers import ParsedChunk


def parse_docx(file_path: str) -> list[ParsedChunk]:
    """
    Parses a DOCX file and extracts text into logical pages.
    Since DOCX doesn't have strict pagination like PDF, we group 
    paragraphs into logical 'pages' of approximately 500 words.
    
    Args:
        file_path (str): Path to the .docx file.
        
    Returns:
        list[ParsedChunk]: List of extracted chunks.
    """
    chunks = []
    current_paragraphs = []
    current_word_count = 0
    page_number = 1
    chunk_index = 0
    
    doc = Document(file_path)
    
    for para in doc.paragraphs:
        text = para.text.strip()
        
        # Skip empty paragraphs
        if not text:
            continue
            
        words = text.split()
        word_count = len(words)
        
        # If adding this paragraph exceeds the 500-word limit, flush current buffer
        if current_word_count + word_count > 500 and current_paragraphs:
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
        
    return chunks

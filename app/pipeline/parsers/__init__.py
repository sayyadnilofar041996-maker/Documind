"""
DocuMind - pipeline/parsers/__init__.py
Purpose : Shared data contract for all DocuMind parsers.
This module defines the standard interface for extracted document content.
"""
from dataclasses import dataclass


@dataclass
class ParsedChunk:
    """
    Standard data contract for a single chunk of parsed document content.
    
    Attributes:
        text (str): The extracted text content from the document.
        page_number (int): The page number this chunk came from.
        chunk_index (int): The position index of this chunk within the document.
    """
    text: str
    page_number: int
    chunk_index: int

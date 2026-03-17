# DocuMind - pipeline/parsers package

from pydantic import BaseModel

class ParsedChunk(BaseModel):
    """Internal model for parsed chunks before being stored in the database."""
    text: str
    page_number: int | None = None
    chunk_index: int

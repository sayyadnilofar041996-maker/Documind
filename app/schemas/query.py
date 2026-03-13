"""
DocuMind - schemas/query.py
Purpose : Pydantic models for RAG query system — requests, responses, sources
Phase   : 4 — Query System
"""

import uuid
from pydantic import BaseModel, Field, ConfigDict


class AskRequest(BaseModel):
    """Schema for a query request."""
    model_config = ConfigDict(from_attributes=True)

    question: str = Field(..., description="The user's question about the document(s)")
    document_id: uuid.UUID | None = Field(None, description="Optional document ID to restrict search to")
    session_id: uuid.UUID | None = Field(None, description="Optional session ID for chat history context")


class SourceChunk(BaseModel):
    """Schema for a retrieved source chunk with relevance score."""
    model_config = ConfigDict(from_attributes=True)

    chunk_id: uuid.UUID
    document_name: str
    page_number: int | None
    text: str
    score: float = Field(..., description="Cosine similarity score")


class AskResponse(BaseModel):
    """Schema for the RAG query response."""
    model_config = ConfigDict(from_attributes=True)

    answer: str
    session_id: uuid.UUID
    latency_ms: int
    sources: list[SourceChunk]

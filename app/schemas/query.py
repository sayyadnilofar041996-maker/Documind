"""
DocuMind - schemas/query.py
Purpose : Pydantic v2 schemas for RAG query system, sessions, and messages
Phase   : 5 — Session Management
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ── Existing Query Schemas ────────────────────────────────────

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


# ── New Session Schemas ───────────────────────────────────────

class MessageResponse(BaseModel):
    """Schema for a single message within a session."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    source_chunks: dict | None = None
    latency_ms: int | None = None
    created_at: datetime


class SessionListResponse(BaseModel):
    """Schema for a session summary in a list view."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    document_id: uuid.UUID | None
    message_count: int
    created_at: datetime


class SessionDetailResponse(BaseModel):
    """Schema for a detailed session view including full message history."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    document_id: uuid.UUID | None
    messages: list[MessageResponse]
    created_at: datetime

"""
DocuMind - tests/test_documents.py
Purpose : pytest tests for document upload, retrieval, deletion
Phase   : 8
"""
import pytest
import uuid
import io
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.document import Document, DocumentStatus
from app.models.user import User

@pytest.mark.asyncio
async def test_upload_valid_pdf(client: AsyncClient, test_user: User):
    """Test uploading a valid PDF file."""
    # Note: test_user and client should be provided by conftest.py
    # We assume auth is working or mocked
    
    file_content = b"%PDF-1.4 test content"
    files = {"file": ("test.pdf", file_content, "application/pdf")}
    
    response = await client.post("/api/v1/documents/upload", files=files)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["original_filename"] == "test.pdf"
    assert data["file_type"] == "pdf"
    assert data["status"] == "pending"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_documents(client: AsyncClient, test_user: User):
    """Test listing documents for the user."""
    response = await client.get("/api/v1/documents/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data
    assert "total" in data

@pytest.mark.asyncio
async def test_get_document_status(client: AsyncClient, test_user: User):
    """Test getting document status."""
    # First upload a file
    file_content = b"test content"
    files = {"file": ("test.py", file_content, "text/x-python")}
    upload_res = await client.post("/api/v1/documents/upload", files=files)
    doc_id = upload_res.json()["id"]
    
    response = await client.get(f"/api/v1/documents/{doc_id}/status")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == doc_id
    assert "status" in data

@pytest.mark.asyncio
async def test_delete_document(client: AsyncClient, test_user: User, db: AsyncSession):
    """Test deleting a document."""
    # First upload
    file_content = b"test content"
    files = {"file": ("delete_me.md", file_content, "text/markdown")}
    upload_res = await client.post("/api/v1/documents/upload", files=files)
    doc_id = upload_res.json()["id"]
    
    # Delete
    response = await client.delete(f"/api/v1/documents/{doc_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify DB
    stmt = select(Document).where(Document.id == uuid.UUID(doc_id))
    result = await db.execute(stmt)
    assert result.scalar_one_or_none() is None

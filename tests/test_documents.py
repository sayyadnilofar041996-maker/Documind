import pytest
import io
import uuid
from httpx import AsyncClient
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
class TestDocumentEndpoints:

    # ── Upload Tests ──────────────────────────────────────────
    @patch("app.services.document_service.ingest_task")
    async def test_upload_success(self, mock_ingest_task, client: AsyncClient, auth_headers: dict):
        """Test successful document upload."""
        # Mock task.id
        mock_ingest_task.delay.return_value = MagicMock(id="test-task-id")
        
        # Create a mock PDF file
        file_content = b"%PDF-1.4 test content"
        files = {"file": ("test.pdf", file_content, "application/pdf")}
        
        response = await client.post(
            "/api/v1/documents/upload",
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["original_filename"] == "test.pdf"
        assert "id" in data
        assert data["status"] == "processing"

    async def test_upload_unauthenticated(self, client: AsyncClient):
        """Test upload fails without token."""
        files = {"file": ("test.pdf", b"content", "application/pdf")}
        response = await client.post("/api/v1/documents/upload", files=files)
        assert response.status_code == 401

    # ── Listing Tests ──────────────────────────────────────────
    @patch("app.services.document_service.ingest_task")
    async def test_list_documents_success(self, mock_ingest_task, client: AsyncClient, auth_headers: dict):
        """Test successful retrieval of user's documents."""
        # Mock task.id
        mock_ingest_task.delay.return_value = MagicMock(id="test-task-id")
        
        # Upload one document first to ensure list isn't empty (optional but good)
        files = {"file": ("list_test.pdf", b"%PDF-1.4 content", "application/pdf")}
        await client.post("/api/v1/documents/upload", files=files, headers=auth_headers)
        
        response = await client.get("/api/v1/documents/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 1
        assert data["items"][0]["original_filename"] == "list_test.pdf"

    async def test_list_documents_unauthenticated(self, client: AsyncClient):
        """Test listing fails without token."""
        response = await client.get("/api/v1/documents/")
        assert response.status_code == 401

    # ── Status Tests ──────────────────────────────────────────
    @patch("app.services.document_service.ingest_task")
    @patch("app.services.document_service.AsyncResult")
    async def test_get_status_success(self, mock_async_result, mock_ingest_task, client: AsyncClient, auth_headers: dict):
        """Test fetching document processing status."""
        # Mock task.id
        mock_ingest_task.delay.return_value = MagicMock(id="test-task-id")
        
        # 1. Upload a document
        files = {"file": ("status_test.pdf", b"%PDF-1.4 content", "application/pdf")}
        upload_resp = await client.post("/api/v1/documents/upload", files=files, headers=auth_headers)
        doc_id = upload_resp.json()["id"]
        
        # 2. Mock Celery AsyncResult
        mock_result_instance = MagicMock()
        mock_result_instance.state = "PENDING"
        mock_async_result.return_value = mock_result_instance
        
        # 3. Get status
        response = await client.get(f"/api/v1/documents/{doc_id}/status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert str(data["id"]) == doc_id
        assert "status" in data
        assert "progress_pct" in data
        # we expect 50.0 because the service sets status to PROCESSING after upload
        assert data["progress_pct"] == 50.0

    async def test_get_status_wrong_owner(self, client: AsyncClient, auth_headers: dict):
        """Test fetching status for a non-existent or someone else's document."""
        random_id = uuid.uuid4()
        response = await client.get(f"/api/v1/documents/{random_id}/status", headers=auth_headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

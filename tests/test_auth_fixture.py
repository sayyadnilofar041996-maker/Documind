import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_auth_fixture(client: AsyncClient, auth_headers: dict, test_user_data: dict):
    # Use the auth_headers fixture to hit a protected route
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert "id" in data

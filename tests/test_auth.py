import pytest


@pytest.mark.asyncio
async def test_register_success(async_client):
    response = await async_client.post("/api/auth/register", json={
        "email": "newuser@example.com",
        "password": "password123",
    })
    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert "id" in data["user"]
    assert "password_hash" not in data["user"]


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client, test_user):
    response = await async_client.post("/api/auth/register", json={
        "email": test_user.email,
        "password": "password123",
    })
    assert response.status_code == 409
    data = response.json()
    assert data["error"]["code"] == "AUTH_EMAIL_EXISTS"


@pytest.mark.asyncio
async def test_login_success(async_client, test_user):
    response = await async_client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email


@pytest.mark.asyncio
async def test_login_invalid_password(async_client, test_user):
    response = await async_client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "wrongpassword",
    })
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "AUTH_INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_me_with_valid_token(async_client, test_user, auth_headers):
    response = await async_client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email


@pytest.mark.asyncio
async def test_me_with_invalid_token(async_client):
    response = await async_client.get("/api/auth/me", headers={"Authorization": "Bearer invalid-token"})
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "AUTH_INVALID_TOKEN"


@pytest.mark.asyncio
async def test_register_short_password(async_client):
    response = await async_client.post("/api/auth/register", json={
        "email": "short@example.com",
        "password": "short",
    })
    assert response.status_code == 422

import pytest
from fastapi.testclient import TestClient


def test_register_user(client: TestClient):
    """Test user registration"""
    user_data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "password123",
        "full_name": "New User"
    }
    
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]
    assert "id" in data


def test_register_duplicate_email(client: TestClient, test_user):
    """Test registration with duplicate email"""
    # Register first user
    client.post("/api/v1/auth/register", json=test_user)
    
    # Try to register again with same email
    response = client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client: TestClient, test_user):
    """Test successful login"""
    # Register user first
    client.post("/api/v1/auth/register", json=test_user)
    
    # Login
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client: TestClient):
    """Test login with invalid credentials"""
    login_data = {
        "username": "nonexistent",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


def test_get_current_user(authenticated_client: TestClient):
    """Test getting current user info"""
    response = authenticated_client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "username" in data
    assert "id" in data


def test_unauthorized_access(client: TestClient):
    """Test accessing protected route without authentication"""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
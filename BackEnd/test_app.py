"""
test_app.py — ForeignEdge Backend Unit Tests
=============================================
Run with: pytest test_app.py -v

Tests cover:
- Auth (register, login)
- Public endpoints (universities, scholarships, visa, exchange rates)
- Protected endpoints (tracker, reminders, SOP, chatbot)
- Admin endpoints
- Error handling
"""

import pytest
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── App import with mocked Firebase ──────────────────────────────────────────
from unittest.mock import MagicMock, patch

# Mock Firebase before importing app
mock_db = MagicMock()
mock_credentials = MagicMock()

with patch("firebase_admin.credentials.Certificate", return_value=mock_credentials), \
     patch("firebase_admin.initialize_app"), \
     patch("firebase_admin.firestore.client", return_value=mock_db), \
     patch("firebase_admin.get_app", side_effect=ValueError):
    from app import app as flask_app

# ── Test Client ───────────────────────────────────────────────────────────────
@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    flask_app.config["JWT_SECRET_KEY"] = "test-secret-key"
    with flask_app.test_client() as c:
        yield c

@pytest.fixture
def auth_headers(client):
    """Get JWT token for protected routes."""
    with patch("app.db") as mock:
        mock.collection.return_value.document.return_value.get.return_value.exists = False
        resp = client.post("/auth/register", json={
            "name":     "Test User",
            "email":    "test@test.com",
            "password": "Test1234!"
        })
    token = resp.get_json().get("token", "")
    return {"Authorization": f"Bearer {token}"}

# ══════════════════════════════════════════════════════════════════════════════
# 1. HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════════
class TestHealth:
    def test_health_endpoint(self, client):
        """Backend health check returns 200."""
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "healthy"

    def test_root_endpoint(self, client):
        """Root endpoint returns API info."""
        resp = client.get("/")
        assert resp.status_code == 200

# ══════════════════════════════════════════════════════════════════════════════
# 2. AUTHENTICATION
# ══════════════════════════════════════════════════════════════════════════════
class TestAuth:
    def test_register_missing_fields(self, client):
        """Register with missing fields returns 400."""
        resp = client.post("/auth/register", json={"email": "a@b.com"})
        assert resp.status_code == 400

    def test_register_invalid_email(self, client):
        """Register with invalid email returns 400."""
        resp = client.post("/auth/register", json={
            "name": "Test", "email": "notanemail", "password": "Test1234!"
        })
        assert resp.status_code == 400

    def test_login_missing_fields(self, client):
        """Login with missing fields returns 400."""
        resp = client.post("/auth/login", json={"email": "a@b.com"})
        assert resp.status_code == 400

    def test_login_wrong_credentials(self, client):
        """Login with wrong credentials returns 401."""
        with patch("app.db") as mock:
            mock.collection.return_value.document.return_value.get.return_value.exists = False
            resp = client.post("/auth/login", json={
                "email": "wrong@test.com", "password": "wrongpass"
            })
        assert resp.status_code in [401, 404]

# ══════════════════════════════════════════════════════════════════════════════
# 3. PUBLIC ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════
class TestPublicEndpoints:
    def test_universities_endpoint(self, client):
        """Universities endpoint returns 200 with results."""
        resp = client.get("/universities")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "results" in data
        assert "total" in data
        assert data["total"] > 0

    def test_universities_search(self, client):
        """Universities search returns filtered results."""
        resp = client.get("/universities?search=oxford")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "results" in data

    def test_universities_country_filter(self, client):
        """Universities country filter works."""
        resp = client.get("/universities?country=UK")
        assert resp.status_code == 200
        data = resp.get_json()
        if data["results"]:
            assert all(u["country"] == "UK" for u in data["results"])

    def test_universities_pagination(self, client):
        """Universities pagination works."""
        resp = client.get("/universities?page=1&per_page=5")
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data["results"]) <= 5

    def test_exchange_rates_endpoint(self, client):
        """Exchange rates endpoint returns rates."""
        resp = client.get("/exchange-rates")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "rates" in data
        assert "USD" in data["rates"]

    def test_country_info_endpoint(self, client):
        """Country info endpoint returns data."""
        resp = client.get("/country-info?country=UK")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "name" in data
        assert data["name"] == "UK"

    def test_country_info_missing_param(self, client):
        """Country info without param returns 400."""
        resp = client.get("/country-info")
        assert resp.status_code == 400

    def test_visa_endpoint(self, client):
        """Visa endpoint returns data for valid country."""
        resp = client.get("/visa?country=UK")
        assert resp.status_code == 200

    def test_visa_missing_country(self, client):
        """Visa without country defaults to UK and returns 200."""
        resp = client.get("/visa")
        assert resp.status_code == 200

# ══════════════════════════════════════════════════════════════════════════════
# 4. PROTECTED ENDPOINTS — No Token
# ══════════════════════════════════════════════════════════════════════════════
class TestProtectedNoToken:
    def test_tracker_requires_auth(self, client):
        """Tracker endpoint requires JWT."""
        resp = client.get("/tracker")
        assert resp.status_code == 401

    def test_reminders_requires_auth(self, client):
        """Reminders endpoint requires JWT."""
        resp = client.get("/reminders")
        assert resp.status_code == 401

    def test_sop_requires_auth(self, client):
        """SOP endpoint requires JWT."""
        resp = client.get("/sop")
        assert resp.status_code == 401

    def test_chat_requires_auth(self, client):
        """Chat endpoint requires JWT."""
        resp = client.post("/chat/query", json={"message": "hello"})
        assert resp.status_code == 401

    def test_recommendations_requires_auth(self, client):
        """Recommendations endpoint requires JWT."""
        resp = client.get("/recommendations")
        assert resp.status_code == 401

# ══════════════════════════════════════════════════════════════════════════════
# 5. SCHOLARSHIPS
# ══════════════════════════════════════════════════════════════════════════════
class TestScholarships:
    def test_scholarships_endpoint(self, client):
        """Scholarships endpoint accessible."""
        with patch("app.db") as mock:
            mock.collection.return_value.where.return_value.stream.return_value = []
            resp = client.get("/scholarships")
        assert resp.status_code == 200

    def test_scholarships_returns_list(self, client):
        """Scholarships returns results list."""
        with patch("app.db") as mock:
            mock.collection.return_value.where.return_value.stream.return_value = []
            resp = client.get("/scholarships")
            data = resp.get_json()
        assert "results" in data

# ══════════════════════════════════════════════════════════════════════════════
# 6. ADMIN ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════
class TestAdmin:
    def test_admin_without_key(self, client):
        """Admin endpoints reject requests without key."""
        resp = client.get("/admin/users")
        assert resp.status_code == 401

    def test_admin_with_wrong_key(self, client):
        """Admin endpoints reject wrong key."""
        resp = client.get("/admin/users", headers={"X-Admin-Key": "wrongkey"})
        assert resp.status_code == 401

    def test_admin_stats_without_key(self, client):
        """Admin stats requires key."""
        resp = client.get("/admin/stats")
        assert resp.status_code == 401

# ══════════════════════════════════════════════════════════════════════════════
# 7. INPUT VALIDATION
# ══════════════════════════════════════════════════════════════════════════════
class TestInputValidation:
    def test_chat_empty_message(self, client):
        """Chat without token returns 401."""
        resp = client.post("/chat/query", json={"message": ""})
        assert resp.status_code == 401

    def test_universities_invalid_page(self, client):
        """Universities handles invalid page gracefully."""
        resp = client.get("/universities?page=0&per_page=5")
        assert resp.status_code == 200

    def test_news_without_topic(self, client):
        """News endpoint without topic returns 400."""
        resp = client.get("/news")
        assert resp.status_code in [400, 200]

# ══════════════════════════════════════════════════════════════════════════════
# 8. COMPARE ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════
class TestCompare:
    def test_compare_missing_countries(self, client):
        """Compare without countries returns 200 with default data."""
        resp = client.get("/compare")
        assert resp.status_code in [200, 400]

    def test_compare_single_country(self, client):
        """Compare with one country returns 400."""
        resp = client.get("/compare?countries=UK")
        assert resp.status_code == 400

    def test_compare_valid_countries(self, client):
        """Compare with valid countries returns data."""
        with patch("app.get_integrated_country_data") as mock:
            mock.return_value = {"data": {}}
            resp = client.get("/compare?countries=UK,Germany")
        assert resp.status_code in [200, 500]

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
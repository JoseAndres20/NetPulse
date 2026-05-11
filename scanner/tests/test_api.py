from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_scan_stream_no_params():
    # Mock scanner.scan_generator to avoid real scapy/nmap calls
    with patch("app.api.endpoints.scanner.scan_generator") as mock:
        mock.return_value = (f"data: {i}\n\n" for i in range(3))
        response = client.get("/scan/stream")
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]


def test_scan_stream_invalid_method():
    with patch("app.api.endpoints.scanner.scan_generator"):
        response = client.post("/scan/stream?target=127.0.0.1")
        assert response.status_code == 405  # Method Not Allowed


def test_docs_accessible():
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_json():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "NetPulse" in response.json()["info"]["title"]


def test_404_not_found():
    response = client.get("/non-existent-route")
    assert response.status_code == 404

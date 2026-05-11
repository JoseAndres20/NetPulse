import pytest
from app.core.config import Settings


def test_settings_default_port():
    settings = Settings()
    assert settings.SCANNER_PORT == 8000  # Default


def test_settings_custom_port(monkeypatch):
    monkeypatch.setenv("SCANNER_PORT", "9000")
    settings = Settings()
    assert settings.SCANNER_PORT == 9000


def test_settings_debug_mode(monkeypatch):
    monkeypatch.setenv("DEBUG", "True")
    settings = Settings()
    assert settings.DEBUG is True


def test_settings_env_file_load():
    settings = Settings()
    assert isinstance(settings.SCANNER_PORT, int)


def test_settings_api_key_loading(monkeypatch):
    monkeypatch.setenv("API_KEY", "test-key-123")
    settings = Settings()
    if hasattr(settings, "API_KEY"):
        assert settings.API_KEY == "test-key-123"


def test_settings_invalid_port(monkeypatch):
    monkeypatch.setenv("SCANNER_PORT", "not-a-number")
    # Using a specific error type to satisfy B017
    with pytest.raises(ValueError):
        Settings()

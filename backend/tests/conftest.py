"""Shared pytest fixtures for backend tests."""

import importlib
import json
from collections.abc import Generator
from typing import Any

import pytest


@pytest.fixture
def app_module(tmp_path: Any, monkeypatch: pytest.MonkeyPatch) -> Generator[Any, None, None]:
    """Reload the Flask app with isolated data and static directories.

    Args:
        tmp_path: Pytest temporary directory fixture.
        monkeypatch: Pytest monkeypatch fixture.

    Yields:
        Reloaded app module configured for isolated testing.
    """
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    tickets_path = data_dir / "tickets.json"
    tickets_path.write_text(json.dumps({"tickets": []}), encoding="utf-8")

    static_dir = tmp_path / "static"
    static_dir.mkdir()
    (static_dir / "index.html").write_text("<html><body>IDS</body></html>", encoding="utf-8")
    (static_dir / "app.js").write_text("console.log('ok');", encoding="utf-8")

    monkeypatch.setenv("DATA_DIR", str(data_dir))
    monkeypatch.delenv("FLASK_ENV", raising=False)

    import app as app_module

    importlib.reload(app_module)
    app_module.STATIC_FOLDER = str(static_dir)
    app_module.app.config["TESTING"] = True

    yield app_module

    importlib.reload(app_module)


@pytest.fixture
def client(app_module: Any) -> Any:
    """Return a Flask test client backed by the isolated app module.

    Args:
        app_module: Reloaded Flask app module fixture.

    Returns:
        Flask test client instance.
    """
    return app_module.app.test_client()

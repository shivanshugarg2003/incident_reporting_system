"""Unit tests for the Flask application and ticket API."""

import importlib
import json
import runpy
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from werkzeug.exceptions import BadRequest, InternalServerError


def _ticket_payload(**overrides: Any) -> dict[str, Any]:
    """Build a valid create-ticket payload with optional overrides.

    Args:
        **overrides: Field values to override on the default payload.

    Returns:
        Ticket creation payload dictionary.
    """
    payload = {
        "reporter_name": "Test Reporter",
        "source_type": "Email",
        "incident_date": "2026-06-29",
        "description": "Minor UI glitch on settings page",
    }
    payload.update(overrides)
    return payload


def test_load_tickets_returns_empty_when_file_missing(app_module: Any, tmp_path: Any) -> None:
    """load_tickets returns an empty list when tickets.json does not exist."""
    missing_dir = tmp_path / "missing-data"
    missing_dir.mkdir()
    app_module.TICKETS_PATH = str(missing_dir / "tickets.json")

    assert app_module.load_tickets() == []


def test_production_default_data_dir(tmp_path: Any, monkeypatch: pytest.MonkeyPatch) -> None:
    """Production mode defaults DATA_DIR to the backend data folder when unset."""
    monkeypatch.setenv("FLASK_ENV", "production")
    monkeypatch.delenv("DATA_DIR", raising=False)

    import app as app_module

    importlib.reload(app_module)

    expected = app_module.os.path.join(app_module.os.path.dirname(app_module.__file__), "data")
    assert app_module.DATA_DIR == expected

    importlib.reload(app_module)


def test_create_ticket_success(client: Any) -> None:
    """POST /tickets creates a ticket with router-assigned priority and status."""
    response = client.post(
        "/tickets",
        json=_ticket_payload(description="system down in production"),
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["priority"] == "Critical"
    assert body["status"] == "Open"
    assert body["created_at"].endswith("Z")
    assert body["reporter_name"] == "Test Reporter"
    assert body["attachment_filename"] is None


def test_create_ticket_with_attachment_filename(client: Any) -> None:
    """POST /tickets stores an optional attachment filename."""
    response = client.post(
        "/tickets",
        json=_ticket_payload(attachment_filename="  evidence.log  "),
    )

    assert response.status_code == 201
    assert response.get_json()["attachment_filename"] == "  evidence.log  "


@pytest.mark.parametrize(
    "missing_field",
    ["reporter_name", "source_type", "incident_date", "description"],
)
def test_create_ticket_missing_required_field(client: Any, missing_field: str) -> None:
    """POST /tickets returns 400 when a required field is missing or blank."""
    payload = _ticket_payload()
    payload[missing_field] = "   " if missing_field != "source_type" else ""

    response = client.post("/tickets", json=payload)

    assert response.status_code == 400
    assert missing_field in response.get_json()["error"]


def test_create_ticket_missing_body(client: Any) -> None:
    """POST /tickets returns 400 when the request body is empty."""
    response = client.post("/tickets", json=None)

    assert response.status_code == 400
    assert "reporter_name" in response.get_json()["error"]


def test_get_tickets_empty(client: Any) -> None:
    """GET /tickets returns an empty list when no tickets exist."""
    response = client.get("/tickets")

    assert response.status_code == 200
    assert response.get_json() == {"tickets": []}


def test_get_tickets_sorted_and_recomputes_priority(
    app_module: Any,
    client: Any,
) -> None:
    """GET /tickets sorts by incident date and recomputes stale priorities."""
    stale_tickets = {
        "tickets": [
            {
                "id": "ticket-old",
                "reporter_name": "Old",
                "source_type": "Email",
                "incident_date": "2026-06-01",
                "description": "system down in production",
                "priority": "Low",
                "created_at": "2026-06-01T10:00:00Z",
            },
            {
                "id": "ticket-new",
                "reporter_name": "New",
                "source_type": "Portal",
                "incident_date": "2026-06-29",
                "description": "minor UI glitch",
                "created_at": "2026-06-29T10:00:00Z",
            },
        ]
    }

    with open(app_module.TICKETS_PATH, "w", encoding="utf-8") as file:
        json.dump(stale_tickets, file)

    response = client.get("/tickets")

    assert response.status_code == 200
    tickets = response.get_json()["tickets"]
    assert [ticket["id"] for ticket in tickets] == ["ticket-new", "ticket-old"]
    assert tickets[1]["priority"] == "Critical"
    assert tickets[1]["status"] == "Open"

    with open(app_module.TICKETS_PATH, encoding="utf-8") as file:
        saved = json.load(file)

    assert saved["tickets"][0]["priority"] == "Critical"
    assert saved["tickets"][0]["status"] == "Open"


def test_update_ticket_success(client: Any) -> None:
    """PUT /tickets/:id updates fields and recomputes priority from description."""
    created = client.post(
        "/tickets",
        json=_ticket_payload(description="minor UI glitch"),
    ).get_json()

    response = client.put(
        f"/tickets/{created['id']}",
        json={
            "description": "system down in production",
            "status": "Closed",
            "reporter_name": "  Updated Name  ",
        },
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["priority"] == "Critical"
    assert body["status"] == "Closed"
    assert body["reporter_name"] == "Updated Name"


def test_update_ticket_non_string_field(client: Any) -> None:
    """PUT /tickets/:id accepts non-string values without stripping."""
    created = client.post("/tickets", json=_ticket_payload()).get_json()

    response = client.put(
        f"/tickets/{created['id']}",
        json={"attachment_filename": None},
    )

    assert response.status_code == 200
    assert response.get_json()["attachment_filename"] is None


def test_update_ticket_not_found(client: Any) -> None:
    """PUT /tickets/:id returns 404 when the ticket does not exist."""
    response = client.put(
        "/tickets/missing-id",
        json={"description": "system down"},
    )

    assert response.status_code == 404
    assert response.get_json()["error"] == "Ticket not found"


def test_delete_ticket_success(client: Any) -> None:
    """DELETE /tickets/:id removes the ticket and returns confirmation."""
    created = client.post("/tickets", json=_ticket_payload()).get_json()

    response = client.delete(f"/tickets/{created['id']}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["message"] == "Ticket deleted"
    assert body["id"] == created["id"]
    assert client.get("/tickets").get_json()["tickets"] == []


def test_delete_ticket_not_found(client: Any) -> None:
    """DELETE /tickets/:id returns 404 when the ticket does not exist."""
    response = client.delete("/tickets/missing-id")

    assert response.status_code == 404
    assert response.get_json()["error"] == "Ticket not found"


def test_handle_bad_request(app_module: Any) -> None:
    """The 400 error handler returns a JSON error payload."""
    error = BadRequest("Invalid input")

    with app_module.app.app_context():
        response, status_code = app_module.handle_bad_request(error)

    assert status_code == 400
    assert response.get_json()["error"] == "Invalid input"


def test_handle_bad_request_default_message(app_module: Any) -> None:
    """The 400 error handler falls back to a default message."""
    with app_module.app.app_context():
        response, status_code = app_module.handle_bad_request(MagicMock(spec=[]))

    assert status_code == 400
    assert response.get_json()["error"] == "Bad request"


def test_handle_server_error(app_module: Any) -> None:
    """The 500 error handler returns a JSON error payload."""
    error = InternalServerError("Database unavailable")

    with app_module.app.app_context():
        response, status_code = app_module.handle_server_error(error)

    assert status_code == 500
    assert response.get_json()["error"] == "Database unavailable"


def test_handle_server_error_default_message(app_module: Any) -> None:
    """The 500 error handler falls back to a default message."""
    with app_module.app.app_context():
        response, status_code = app_module.handle_server_error(MagicMock(spec=[]))

    assert status_code == 500
    assert response.get_json()["error"] == "Internal server error"


def test_serve_react_index(client: Any) -> None:
    """GET / serves the React index.html fallback."""
    response = client.get("/")

    assert response.status_code == 200
    assert b"IDS" in response.data


def test_serve_react_static_asset(client: Any) -> None:
    """GET /app.js serves an existing static asset."""
    response = client.get("/app.js")

    assert response.status_code == 200
    assert b"console.log" in response.data


def test_serve_react_unknown_route(client: Any) -> None:
    """Unknown frontend routes fall back to index.html."""
    response = client.get("/dashboard")

    assert response.status_code == 200
    assert b"IDS" in response.data


def test_find_ticket_index(app_module: Any) -> None:
    """_find_ticket_index returns the ticket index or None."""
    tickets = [{"id": "a"}, {"id": "b"}]

    assert app_module._find_ticket_index(tickets, "b") == 1
    assert app_module._find_ticket_index(tickets, "missing") is None


def test_main_entrypoint(app_module: Any) -> None:
    """Running app.py as __main__ starts the Flask development server."""
    with patch.object(app_module.app.__class__, "run") as mock_run:
        runpy.run_path(app_module.__file__, run_name="__main__")

    mock_run.assert_called_once_with(host="0.0.0.0", port=5000, debug=False)

"""Flask application entry point for the Incident Reporting System."""

import json
import os
import uuid
from datetime import UTC, datetime

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from router import assign_priority

load_dotenv()

_local_data = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "data"))
_docker_data = os.path.join(os.path.dirname(__file__), "data")
_default_data = (
    _docker_data
    if os.environ.get("FLASK_ENV") == "production"
    else _local_data
)
DATA_DIR = os.environ.get("DATA_DIR", _default_data)
TICKETS_PATH = os.path.join(DATA_DIR, "tickets.json")
STATIC_FOLDER = os.path.join(os.path.dirname(__file__), "static")

app = Flask(__name__)

allowed_origin = os.environ.get("ALLOWED_ORIGIN", "*")
CORS(app, origins=[allowed_origin])


def load_tickets() -> list:
    """Read and return the tickets array from the JSON data file.

    Returns:
        List of ticket dictionaries stored in tickets.json.
    """
    if not os.path.exists(TICKETS_PATH):
        return []

    with open(TICKETS_PATH, encoding="utf-8") as file:
        data = json.load(file)
    return data.get("tickets", [])


def save_tickets(tickets: list) -> None:
    """Write the updated tickets list back to the JSON data file.

    Args:
        tickets: List of ticket dictionaries to persist.
    """
    os.makedirs(os.path.dirname(TICKETS_PATH), exist_ok=True)
    with open(TICKETS_PATH, "w", encoding="utf-8") as file:
        json.dump({"tickets": tickets}, file, indent=2)


def _find_ticket_index(tickets: list, ticket_id: str) -> int | None:
    """Find the index of a ticket by its ID.

    Args:
        tickets: List of ticket dictionaries.
        ticket_id: UUID string of the ticket to locate.

    Returns:
        Index of the ticket or None if not found.
    """
    for index, ticket in enumerate(tickets):
        if ticket.get("id") == ticket_id:
            return index
    return None


@app.route("/tickets", methods=["POST"])
def create_ticket() -> tuple:
    """Create a new incident ticket from the request JSON body.

    Returns:
        JSON response with the created ticket and HTTP 201, or an error response.
    """
    body = request.get_json(silent=True) or {}

    required_fields = ["reporter_name", "source_type", "incident_date", "description"]
    for field in required_fields:
        value = body.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    description = body.get("description", "").strip()

    ticket = {
        "id": str(uuid.uuid4()),
        "reporter_name": body["reporter_name"].strip(),
        "source_type": body["source_type"],
        "incident_date": body["incident_date"],
        "description": description,
        "attachment_filename": body.get("attachment_filename") or None,
        "priority": assign_priority(description),
        "status": "Open",
        "created_at": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    }

    tickets = load_tickets()
    tickets.append(ticket)
    save_tickets(tickets)

    return jsonify(ticket), 201


@app.route("/tickets", methods=["GET"])
def get_tickets() -> tuple:
    """Return all tickets sorted by incident date descending.

    Recomputes priority from each ticket description so dashboard filters
    always reflect the current routing rules.

    Returns:
        JSON response with tickets array and HTTP 200.
    """
    tickets = load_tickets()
    priority_updated = False

    for ticket in tickets:
        description = ticket.get("description", "")
        priority = assign_priority(description)
        if ticket.get("priority") != priority:
            ticket["priority"] = priority
            priority_updated = True
        if "status" not in ticket:
            ticket["status"] = "Open"
            priority_updated = True

    if priority_updated:
        save_tickets(tickets)

    sorted_tickets = sorted(
        tickets,
        key=lambda ticket: ticket.get("incident_date", ""),
        reverse=True,
    )
    return jsonify({"tickets": sorted_tickets}), 200


@app.route("/tickets/<ticket_id>", methods=["PUT"])
def update_ticket(ticket_id: str) -> tuple:
    """Update an existing ticket by ID.

    Args:
        ticket_id: UUID of the ticket to update.

    Returns:
        JSON response with the updated ticket and HTTP 200, or an error response.
    """
    body = request.get_json(silent=True) or {}
    tickets = load_tickets()
    index = _find_ticket_index(tickets, ticket_id)

    if index is None:
        return jsonify({"error": "Ticket not found"}), 404

    ticket = tickets[index]
    updatable_fields = [
        "reporter_name",
        "source_type",
        "incident_date",
        "description",
        "attachment_filename",
        "status",
    ]

    for field in updatable_fields:
        if field in body:
            value = body[field]
            if isinstance(value, str):
                value = value.strip()
            ticket[field] = value

    if "description" in body:
        ticket["priority"] = assign_priority(ticket.get("description"))

    tickets[index] = ticket
    save_tickets(tickets)

    return jsonify(ticket), 200


@app.route("/tickets/<ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id: str) -> tuple:
    """Delete a ticket by ID.

    Args:
        ticket_id: UUID of the ticket to delete.

    Returns:
        JSON confirmation and HTTP 200, or an error response.
    """
    tickets = load_tickets()
    index = _find_ticket_index(tickets, ticket_id)

    if index is None:
        return jsonify({"error": "Ticket not found"}), 404

    removed = tickets.pop(index)
    save_tickets(tickets)

    return jsonify({"message": "Ticket deleted", "id": removed.get("id")}), 200


@app.errorhandler(400)
def handle_bad_request(error) -> tuple:
    """Return a JSON error response for HTTP 400 errors.

    Args:
        error: Flask error object.

    Returns:
        JSON error payload and HTTP 400 status code.
    """
    message = getattr(error, "description", "Bad request")
    return jsonify({"error": message}), 400


@app.errorhandler(500)
def handle_server_error(error) -> tuple:
    """Return a JSON error response for HTTP 500 errors.

    Args:
        error: Flask error object.

    Returns:
        JSON error payload and HTTP 500 status code.
    """
    message = getattr(error, "description", "Internal server error")
    return jsonify({"error": message}), 500


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path: str):
    """Serve React frontend static files.

    Handles React static assets (JS, CSS, images) and React Router routes
    (falls back to index.html). Defined after /tickets routes so API takes priority.
    """
    if path and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        return send_from_directory(STATIC_FOLDER, path)
    return send_from_directory(STATIC_FOLDER, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

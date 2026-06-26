# Incident Reporting & Routing System

A full-stack incident reporting application that lets users submit incident tickets through a React frontend and automatically routes them to Critical or Low priority based on keyword detection. All ticket data is persisted locally in a JSON file served by a Flask API.

## Architecture

```
Browser (React :5173)
        |
        |  HTTP /api/* (Vite proxy)
        v
Flask API (:5000)
        |
        |  read / write
        v
data/tickets.json
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, Vite, Tailwind CSS | Incident intake form and ticket dashboard |
| API | Python Flask, Flask-CORS | REST endpoints for ticket creation and retrieval |
| Storage | JSON file (tickets.json) | Local persistence of incident tickets |
| Dev Environment | Node.js 20, Python 3.11, concurrently | Run frontend and backend together |

## Prerequisites

- Node.js 20 LTS
- Python 3.11
- npm
- pip

## Setup & Run

### Frontend

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Start the Vite dev server:

```bash
npm run dev
```

The frontend runs at http://localhost:5173

### Backend

1. Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

2. Start the Flask API:

```bash
cd backend
python app.py
```

The API runs at http://localhost:5000

### Run Both (from project root)

```bash
npm install
npm run dev
```

## API Reference

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| POST | /tickets | `{ "reporter_name": "string", "source_type": "string", "incident_date": "YYYY-MM-DD", "description": "string", "attachment_filename": "string or null" }` | `201` — created ticket object |
| GET | /tickets | None | `200` — `{ "tickets": [ ... ] }` sorted by incident_date descending |

### Example POST request

```json
{
  "reporter_name": "Jane Doe",
  "source_type": "Email",
  "incident_date": "2026-06-20",
  "description": "System down in production environment",
  "attachment_filename": "incident.eml"
}
```

### Example POST response (201)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "reporter_name": "Jane Doe",
  "source_type": "Email",
  "incident_date": "2026-06-20",
  "description": "System down in production environment",
  "attachment_filename": "incident.eml",
  "priority": "Critical",
  "created_at": "2026-06-26T10:30:00.000000Z"
}
```

## Routing Rules

The following keywords in a ticket description trigger **Critical** priority. All matching is case-insensitive.

1. system down
2. security down
3. error 500 (also matches error500)
4. server crash
5. data breach
6. outage
7. critical failure
8. unauthorized access (also matches unauthorised access)

If none of the patterns match, the ticket is assigned **Low** priority.

## Project Structure

```
Incident_Reporting_System/
  frontend/
    src/
      components/
        IncidentForm.jsx
        Navbar.jsx
        TicketDashboard.jsx
      pages/
        SubmitPage.jsx
        DashboardPage.jsx
      App.jsx
      main.jsx
      index.css
    vite.config.js
    tailwind.config.js
    package.json
  backend/
    app.py
    router.py
    requirements.txt
  data/
    tickets.json
  docs/
    README.md
    prompt_log.md
  package.json
  .nvmrc
  .python-version
```

## Known Limitations

- PDF text extraction not implemented (filename captured only)
- No authentication — internal use only
- Runs on localhost — not production ready
- tickets.json is not thread-safe for concurrent writes

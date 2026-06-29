# Incident Reporting and Routing System

**Version:** 1.0.0  
**License:** MIT

A full-stack incident reporting application where users submit incidents through a React form, a Python routing engine assigns **Critical** or **Low** priority, and tickets are stored in JSON and displayed on a color-coded dashboard.

---

## Overview

The Incident Reporting and Routing System (IRS) provides a lightweight workflow for capturing operational incidents, automatically classifying severity based on description keywords, and managing tickets through a web dashboard with search, filters, edit, delete, and export capabilities.

Built with Cursor AI-assisted development, the project demonstrates end-to-end full-stack engineering: React frontend, Flask API, Python rule engine, Playwright E2E automation, pytest unit tests with 100% backend coverage, and Docker-based deployment.

---

## Problem Statement

Operations teams need a simple way to report incidents without manual triage. Critical failures (system outages, security events, HTTP 500 errors) must be surfaced immediately, while minor issues should be deprioritized. Manual classification is slow, inconsistent, and error-prone.

---

## Objectives

| Objective | Description |
|-----------|-------------|
| Task 1 | Configure development environment and monorepo structure |
| Task 2 | Build a validated React incident intake form |
| Task 3 | Implement Python keyword routing and a priority dashboard |
| Task 4 | Document the project and maintain a Cursor prompt audit log |

---

## Features

### Core (Tasks 1-4)

- Incident intake form with four validated fields
- Automatic priority assignment (Critical / Low) via Python router
- JSON file persistence (`data/tickets.json`)
- Dashboard with color-coded priority badges and row highlighting
- Filters: All, Critical, Low
- REST API: POST, GET, PUT, DELETE `/tickets`

### Additional Capabilities

- Dashboard search by reporter, description, and source type
- Edit and delete tickets with confirmation dialog
- Export tickets as JSON or CSV
- Light and dark theme with localStorage persistence
- Client-side notification system
- 81 Playwright E2E tests and 70 pytest unit tests

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Python 3.11, Flask, Flask-CORS, Gunicorn |
| Routing Engine | Python regex keyword matcher (`backend/router.py`) |
| Storage | JSON file (`data/tickets.json`) |
| Unit Testing | pytest, pytest-cov (100% coverage on backend) |
| E2E Testing | Playwright (TypeScript), Page Object Model |
| Deployment | Docker multi-stage build, docker-compose, GitLab CI |
| IDE | Cursor (Composer + Agent) |

---

## Architecture

```text
+------------------+       POST/GET/PUT/DELETE        +------------------+
|  React Frontend  |  <--------------------------->   |   Flask API      |
|  (Vite / :5173)  |         /tickets JSON           |   (:5000)        |
+------------------+                                 +--------+---------+
                                                              |
                                                              v
                                                     +------------------+
                                                     |   router.py      |
                                                     | assign_priority  |
                                                     +--------+---------+
                                                              |
                                                              v
                                                     +------------------+
                                                     |  tickets.json    |
                                                     |  (data/)         |
                                                     +------------------+
```

**Production (Docker):** A single container serves the React build from `/app/static` and the Flask API via Gunicorn on port 5000.

---

## Project Structure

```text
Incident_Reporting_System/
├── frontend/              React application (Vite + Tailwind)
│   └── src/
│       ├── components/    IncidentForm, TicketDashboard, Navbar
│       ├── pages/         SubmitPage, DashboardPage
│       ├── context/       ThemeContext, NotificationContext
│       └── utils/         export helpers
├── backend/
│   ├── app.py             Flask API entry point
│   ├── router.py          Priority routing engine
│   ├── Dockerfile         Multi-stage production image
│   └── tests/             Pytest suite (100% coverage)
├── data/
│   └── tickets.json       Ticket persistence
├── playwright/            E2E tests (Page Object Model)
├── docs/
│   ├── README.md          Extended documentation copy
│   └── prompt_log.md      Cursor prompt audit log
├── docker-compose.yml
├── DOCKER.md              Docker and GitLab CI guide
└── package.json           npm run dev, test scripts
```

---

## Installation

### Prerequisites

- Node.js 20 LTS
- Python 3.11+ (see `.python-version`)
- npm and pip

### Setup

```bash
git clone https://github.com/shivanshugarg2003/incident_reporting_system.git
cd incident_reporting_system

npm install
npm install --prefix frontend
npm install --prefix playwright
pip install -r backend/requirements.txt
```

---

## Running the Application

### Development (Frontend + Backend)

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:5000 |

### Backend Only

```bash
npm run api
```

### Frontend Only

```bash
npm run start
```

---

## Python Routing Logic

File: `backend/router.py`

The `assign_priority(description)` function scans the normalized description against 35 case-insensitive regex patterns. If any pattern matches, priority is **Critical**; otherwise **Low**.

### Task 3 Minimum Keywords

| Keyword | Example |
|---------|---------|
| `system down` | "The system down affected production" |
| `security down` | "security down on firewall" |
| `error 500` | "Users see error 500 on login" |

### Extended Keywords

| Category | Keywords |
|----------|----------|
| HTTP errors | `500 error`, `http 500`, `error500` |
| Server / infra | `server down`, `server crash`, `server unavailable`, `service unavailable`, `services down`, `production down` |
| Database | `database down`, `database failure`, `db down` |
| Network | `network down`, `network failure`, `network issue`, `connection timeout`, `gateway timeout`, `request timeout` |
| API / app | `api failure`, `api down`, `application crash`, `application down` |
| Security | `data breach`, `unauthorized access`, `authentication failed`, `auth failure`, `denial of service`, `ddos`, `ransomware` |
| Outage | `outage`, `critical failure`, `complete outage` |

Descriptions are trimmed and internal whitespace is collapsed before matching.

### API Response Fields

| Field | Description |
|-------|-------------|
| `priority` | `Critical` or `Low` (auto-assigned) |
| `status` | `Open` on create |
| `created_at` | UTC ISO timestamp |
| `id` | UUID |

---

## Application Workflow

```text
1. User opens Submit Incident page
2. User fills Reporter Name, Source Type, Incident Date, Description
3. Form validates on blur; submit disabled until valid
4. POST /tickets sends payload to Flask API
5. router.py assigns Critical or Low priority
6. Ticket saved to tickets.json
7. Dashboard displays ticket with color-coded badge
8. User can filter, search, edit, delete, or export tickets
```

---

## Routing Rules

| Condition | Priority | Dashboard Display |
|-----------|----------|-------------------|
| Description contains any critical keyword | Critical | Red badge, red row background |
| No keyword match | Low | Green badge, default row |
| GET /tickets | Recomputed | Priority refreshed from current rules |

---

## Playwright Testing

### Run Tests

```bash
npm run test:e2e          # 81 E2E tests
npm run test:backend      # 70 pytest tests, 100% coverage
```

### Test Structure

| Spec File | Coverage |
|-----------|----------|
| `router-api.spec.ts` | Router keywords, API priority assignment |
| `rule-engine.spec.ts` | UI submit to Critical/Low |
| `incident-form.spec.ts` | Form validation and submission |
| `dashboard.spec.ts` | Table, filters, badges, sorting |
| `api-crud.spec.ts` | PUT and DELETE endpoints |
| `api-interception.spec.ts` | POST/GET contract |
| `navigation.spec.ts` | Routes and navbar |
| `theme.spec.ts` | Light/dark toggle persistence |
| `notifications.spec.ts` | Notification bell and dropdown |
| `search.spec.ts` | Dashboard search |
| `edit-delete.spec.ts` | Edit modal and delete flow |
| `export.spec.ts` | JSON and CSV export |

Configuration: Page Object Model, `data-testid` selectors, ticket reset before each test, HTML report, trace on retry, screenshots on failure.

---

## Screenshots

| Screen | Description |
|--------|-------------|
| `docs/screenshots/submit-form.png` | Incident intake form |
| `docs/screenshots/dashboard.png` | Ticket dashboard with filters |
| `docs/screenshots/critical-filter.png` | Critical priority filter |

> Placeholder paths. Add screenshots before portfolio publication.

---

## Deployment Instructions

### Docker (Recommended)

```bash
docker-compose up --build
# Open http://localhost:5000
```

See [DOCKER.md](DOCKER.md) for GitLab Container Registry, environment variables, and CI/CD pipeline details.

### Environment Variables

| Variable | Default (Docker) | Description |
|----------|------------------|-------------|
| `DATA_DIR` | `/app/data` | Directory for `tickets.json` |
| `FLASK_ENV` | `production` | Production data path |
| `ALLOWED_ORIGIN` | `*` | CORS allowed origin |

---

## Future Enhancements

- User authentication and role-based access
- PDF text extraction for uploaded attachments
- Database backend (PostgreSQL) for concurrent writes
- Real-time notifications via WebSocket
- CI pipeline test stage (pytest + Playwright in GitLab CI)
- Health check endpoint for container orchestration

---

## Known Limitations

- No authentication (demo and portfolio use)
- PDF upload stores filename only; content is not parsed
- JSON file storage is not safe for high concurrent write load
- Notifications are client-side only (localStorage)
- Settings button in navbar is non-functional (UI placeholder)
- Docker build not verified on all development machines

---

## Authors

| Name | Role |
|------|------|
| **Shivanshu Garg, Lovepreet Singh** | Full-stack development, QA automation, documentation, Docker/CI |


---

## License

MIT License. See repository for details.

---

## Documentation

| File | Purpose |
|------|---------|
| [docs/prompt_log.md](docs/prompt_log.md) | Cursor AI prompt audit log |
| [DOCKER.md](DOCKER.md) | Docker and GitLab CI deployment guide |
| [docs/README.md](docs/README.md) | Documentation index |

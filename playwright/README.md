# Playwright E2E Tests — Incident Reporting System

End-to-end test suite for the Incident Reporting & Routing System using **Playwright** and **TypeScript** with the **Page Object Model**.

## Prerequisites

- Node.js 20 LTS
- Python 3.11 with Flask dependencies installed
- Application dependencies installed at project root and in `frontend/`

## Setup

From the `playwright/` directory:

```bash
npm install
npx playwright install chromium
```

## Running Tests

From the **project root**:

```bash
npm run test:e2e
```

Or from the `playwright/` directory:

```bash
npm test
```

### Other commands

```bash
npm run test:headed    # Run with visible browser
npm run test:ui        # Playwright UI mode
npm run report         # Open HTML report
```

## Architecture

```
playwright/
├── pages/           # Page Object Model classes
├── tests/           # Test specifications
├── fixtures/        # Extended test fixtures & test data
├── utils/           # API client, ticket store reset, date helpers
└── playwright.config.ts
```

## Test Suites

| File | Coverage |
|------|----------|
| `navigation.spec.ts` | Routes, navbar links, active state |
| `incident-form.spec.ts` | Form load, validation, submit, reset |
| `rule-engine.spec.ts` | Critical/Low priority assignment |
| `dashboard.spec.ts` | Table, filters, sorting, badges, empty state |
| `api-interception.spec.ts` | Request payload, response status/body |

## Configuration

- **Base URL:** `http://localhost:5173`
- **Web server:** `npm run dev` (starts Vite + Flask automatically)
- **Workers:** `1` (shared `data/tickets.json`)
- **Retries:** `1` locally, `2` in CI
- **Trace:** on first retry
- **Screenshot / video:** on failure
- **Reporter:** list + HTML (`playwright-report/`)

## Test Isolation

Each test resets `data/tickets.json` to `{ "tickets": [] }` in a `beforeEach` hook via `utils/ticket-store.ts`.

## Locator Strategy

No `data-testid` attributes exist in the app. Tests use:

- `getByLabel()` for form fields
- `getByRole()` for buttons, links, table, banners
- `getByText()` for messages and counters

## Features Not Tested

Documented gaps (not implemented in the app):

- Authentication / authorization
- Ticket edit or delete
- PDF content extraction
- File binary upload to API
- Individual ticket detail page
- `GET /health` endpoint
- Production deployment concerns

## CI Notes

Set `CI=true` to disable server reuse and enable stricter Playwright CI settings:

```bash
CI=true npm run test:e2e
```

# Cursor AI Prompt Log

**Project:** Incident Reporting and Routing System  
**Version:** 1.0.0  
**Authors:** Shivanshu Garg, Lovepreet  
**Last Updated:** 29 June 2026

---

## Introduction

This document satisfies **Task 4**: *"Document everything. Log the exact prompts that worked best versus prompts which hallucinated."*

It records the Cursor AI prompts used during development, their outcomes, manual corrections, and lessons learned. All examples below are drawn from actual development sessions. No fabricated hallucinations are included.

---

## Development Process

The project was built in four phases aligned with the task specification:

1. **Task 1** — Cursor and Environment Setup
2. **Task 2** — Intake Form (React Frontend via Vibe Coding)
3. **Task 3** — Simple Routing Rule + Dashboard
4. **Task 4** — Documentation, README, and Playwright Automation

Each phase used Cursor Composer with a plan-then-approve workflow defined in `.cursor/rules/Incident Reporting System.mdc`.

---

## Task 1 — Cursor and Environment Setup

### Prompt Used

> Create a monorepo with Vite/React frontend, Flask backend, `data/` and `docs/` folders, and `npm run dev` to run both servers concurrently.

### Purpose

Establish the sacred project structure and a single development command for local full-stack development.

### Result

| Requirement | Status |
|-------------|--------|
| Monorepo folder structure (`frontend/`, `backend/`, `data/`, `docs/`) | Complete |
| `npm run dev` running frontend and backend concurrently | Complete |
| Tailwind CSS configured | Complete |
| Vite proxy to Flask on port 5000 | Complete |
| Cursor rules file (`.cursor/rules/`) | Complete |

### Hallucinations / Issues Encountered

#### Hallucination 1 — React 19 Template Defaults

| Field | Detail |
|-------|--------|
| **Original Prompt** | "Scaffold React app with Vite" |
| **Expected Result** | React 18 per approved dependencies |
| **Actual Result** | Vite template installed React 19 and oxlint |
| **Issue** | Dependencies outside approved list |
| **How Identified** | Checked `frontend/package.json` against cursor rules |
| **How Fixed** | Pinned React 18.3.1; removed oxlint |
| **Improved Prompt** | "Create Vite React 18 app; dependencies: react, react-dom, vite, tailwindcss only" |

### Manual Improvements

| Issue | Fix |
|-------|-----|
| PowerShell `&&` syntax errors | Used `;` separators in shell commands |

---

## Task 2 — Intake Form (React Frontend via Vibe Coding)

### Prompt Used

> Build IncidentForm with four fields: Reporter Name, Source Type (Email/Portal/PDF Upload), Incident Date, and Description. Add blur validation, disable submit until valid, POST to `/tickets`, show success banner, and reset the form.

### Purpose

Deliver the Task 2 incident intake form with field-level validation and API integration.

### Result

| Requirement | Status |
|-------------|--------|
| Reporter Name field (required, min 2 characters) | Complete |
| Source Type radio (Email / Portal / PDF Upload) | Complete |
| Incident Date field (required, no future dates) | Complete |
| Description textarea (required, min 10 characters) | Complete |
| POST `/tickets` on submit | Complete |
| Conditional PDF file picker | Complete |
| Playwright coverage (`incident-form.spec.ts`, 18 tests) | Complete |

### Hallucinations / Issues Encountered

No hallucinations or issues encountered for this task.

### Manual Improvements

| Issue | Fix |
|-------|-----|
| Attachment not reset on source type change | Added reset logic when source type changes |
| Figma UI redesign request | Updated Navbar and form styling; logic unchanged |
| Personal placeholder text in form | Replaced with generic sample name "Jane Smith" |

---

## Task 3 — Simple Routing Rule + Dashboard

Task 3 covers both the Python routing engine and the ticket dashboard. Each sub-phase had its own prompt.

### Prompt 3A — Routing Engine

#### Prompt Used

> Implement `backend/router.py` with keyword matching. If description contains `system down`, `security down`, or `error 500` (case-insensitive), assign Critical priority. Otherwise assign Low. Flask POST/GET `/tickets` must return `priority`, `status` (Open), and `created_at`.

#### Purpose

Deliver the Task 3 Python routing rule and Flask API contract for ticket creation and retrieval.

#### Result

| Requirement | Status |
|-------------|--------|
| Task 3 minimum keywords (`system down`, `security down`, `error 500`) | Complete |
| Case-insensitive keyword matching | Complete |
| Returns `priority`, `status` (Open), `created_at` on create | Complete |
| Extended failure keywords (35 patterns, user-requested) | Complete |
| Whitespace normalization before matching | Complete |

#### Hallucinations / Issues Encountered

##### Hallucination 1 — Scope Creep on Routing

| Field | Detail |
|-------|--------|
| **Original Prompt** | "Improve routing to handle typos and nearby failures" |
| **Expected Result** | Minor normalization only |
| **Actual Result** | Added 20+ keywords and fuzzy matching not in Task 3 spec |
| **Issue** | Over-engineered router beyond assignment requirements |
| **How Identified** | Task audit compared `router.py` against minimum keyword list |
| **How Fixed** | Reverted to spec minimum; re-expanded only when explicitly requested |
| **Improved Prompt** | "Expand router keywords to cover server down, database failure, network issue — list each pattern explicitly" |

#### Manual Improvements

| Issue | Fix |
|-------|-----|
| Stale Flask process after router changes | Documented restart requirement for `npm run dev` |

---

### Prompt 3B — Dashboard

#### Prompt Used

> Build TicketDashboard with color-coded priority badges, Critical row highlighting, All/Critical/Low filters, loading spinner, empty state, and 5-second polling for new tickets.

#### Purpose

Deliver the Task 3 dashboard for viewing, filtering, and managing routed incident tickets.

#### Result

| Requirement | Status |
|-------------|--------|
| Priority badges (Critical = red, Low = green) | Complete |
| Critical row background highlighting | Complete |
| Filter buttons: All / Critical / Low | Complete |
| Loading spinner on initial fetch | Complete |
| Empty state when no tickets exist | Complete |
| Sort by incident date (newest first) | Complete |
| Search, edit, delete, export (enhancement) | Complete |

#### Hallucinations / Issues Encountered

No hallucinations or issues encountered for this task.

#### Manual Improvements

| Issue | Fix |
|-------|-----|
| Filter locator ambiguity (strict mode violation) | Added `data-testid="filter-critical"` and related test IDs |

---

## Task 4 — Documentation (README + this prompt log + Playwright automation)

### Prompt Used

> Write `docs/README.md` and `docs/prompt_log.md` documenting setup, tasks, routing rules, and API. Set up Playwright with Page Object Model, `data-testid` locators, reset `tickets.json` before each test, and cover form validation, routing, dashboard filters, and API interception.

### Purpose

Deliver Task 4 documentation requirements and end-to-end test automation covering all user-facing workflows.

### Result

| Requirement | Status |
|-------------|--------|
| Root `README.md` (setup, architecture, API, deployment) | Complete |
| `docs/prompt_log.md` (this file) | Complete |
| Playwright Page Object Model framework | Complete |
| `resetTickets()` fixture for test isolation | Complete |
| 81 Playwright E2E tests across 12 spec files | Complete |
| 70 pytest backend tests | Complete |
| 100% line coverage on `app.py` and `router.py` | Complete |

### Generated Tests

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `incident-form.spec.ts` | 18 | Form validation and submission |
| `router-api.spec.ts` | 21 | API-level routing |
| `dashboard.spec.ts` | 10 | Filters, badges, sorting |
| `rule-engine.spec.ts` | 6 | UI routing integration |
| `theme.spec.ts` | 5 | Theme persistence |
| `api-crud.spec.ts` | 4 | PUT/DELETE endpoints |
| `api-interception.spec.ts` | 4 | POST/GET contract |
| `navigation.spec.ts` | 3 | Routes and navbar |
| `notifications.spec.ts` | 3 | Notification UI |
| `search.spec.ts` | 3 | Dashboard search |
| `export.spec.ts` | 2 | JSON/CSV export |
| `edit-delete.spec.ts` | 2 | Edit and delete |
| **Total** | **81** | |

Backend pytest: **70 tests**, **100% line coverage** on `app.py` and `router.py`.

### Hallucinations / Issues Encountered

##### Hallucination 1 — Hardcoded Test Assertions

| Field | Detail |
|-------|--------|
| **Original Prompt** | "Assert dashboard shows 'Showing 1 of 2 tickets' after filter" |
| **Expected Result** | Dynamic count assertion |
| **Actual Result** | Test failed when ticket data differed between runs |
| **Issue** | Hardcoded counts assumed fixed JSON state |
| **How Identified** | Playwright failures with leftover tickets from prior tests |
| **How Fixed** | Added `resetTickets()` in `beforeEach`; assert counts from API response |
| **Improved Prompt** | "Reset tickets.json before each test; assert counts dynamically from visible rows" |


### Manual Improvements

| Issue | Fix |
|-------|-----|
| `localhost` resolved to IPv6 on Windows | API client uses `127.0.0.1:5000` |
| Theme test cleared localStorage on every navigation | One-time `evaluate()` instead of `addInitScript` |
| Notification badge squashed by navbar CSS | Scoped button styles in `NotificationDropdown.jsx` |
| Flaky dashboard loading spinner test | Split spinner and empty-state assertions; wait for load completion |

---

## Lessons Learned

| # | Lesson |
|---|--------|
| 1 | Break work into phases: scaffold, form, API, dashboard, tests |
| 2 | Specify exact file paths and function names in prompts |
| 3 | Paste exact keyword arrays instead of vague "improve routing" |
| 4 | Use plan-then-approve for multi-file changes |
| 5 | Design test data isolation (`resetTickets`) from the first test prompt |
| 6 | List approved dependencies to block template extras |
| 7 | Account for Windows PowerShell syntax and IPv6 in test configuration |
| 8 | Restart Flask after backend changes (no hot reload in production mode) |
| 9 | Keep docs/ to README.md and prompt_log.md per project rules |


---

*End of prompt log.*

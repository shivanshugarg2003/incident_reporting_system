# Cursor AI Prompt Log

This file is a structured audit log of Cursor AI prompts used to build the Incident Reporting & Routing System. It records what was requested, what was generated, and whether manual fixes were needed.

## How to Update

After each Cursor session:

1. Add a new entry using the template below (or update an existing entry if revisiting a task).
2. Set **Status** to `WORKED`, `PARTIAL`, or `HALLUCINATED` after reviewing the output.
3. Fill in **Outcome**, **Hallucinations / Issues**, and **Fix Applied** based on actual results.
4. Use the session date in the **Date** field.

## Rating Guide

| Status | Meaning |
|--------|---------|
| **WORKED** | Generated correctly with no fixes needed |
| **PARTIAL** | Needed minor edits |
| **HALLUCINATED** | Wrong file paths, missing logic, or needed full rewrite |

---

## [T1-A] Task 1 — Project Scaffold

**Status:** PARTIAL

**Cursor Mode:** Composer

**Date:** 2026-06-26

**Prompt Summary:** Create monorepo structure with Vite/React frontend, Flask backend, data/docs folders, and root npm scripts.

**Outcome:** Created root configuration (`.gitignore`, `.nvmrc`, `.python-version`, `package.json`), `frontend/` Vite React scaffold, `backend/app.py` and `router.py` with health route, `data/tickets.json`, empty `docs/` files, and `npm run dev` orchestration via `concurrently`.

**Hallucinations / Issues:**
- Vite scaffold defaulted to React 19 and included `oxlint` (not in approved dependency list).
- PowerShell did not accept `&&` in combined install commands.
- Auto-review initially blocked `npm create vite` until plan approval was confirmed.

**Fix Applied:**
- Pinned React to 18 in `frontend/package.json`.
- Removed `oxlint` and default template boilerplate (`App.css`, `.oxlintrc.json`).
- Ran install commands with PowerShell-compatible `;` separators.
- Retried blocked shell command after user approval.

---

## [T1-B] Task 1 — Tailwind & Vite Config

**Status:** WORKED

**Cursor Mode:** Composer

**Date:** 2026-06-26

**Prompt Summary:** Configure Tailwind CSS content paths, `index.css` directives, Vite `/api` proxy, and PostCSS plugins.

**Outcome:** Added `tailwind.config.js` with correct content paths, replaced `index.css` with Tailwind directives, configured Vite proxy for `/api` to `localhost:5000`, and confirmed `postcss.config.js` uses `tailwindcss` and `autoprefixer`.

**Hallucinations / Issues:**
None observed.

**Fix Applied:**
No manual changes required.

---

## [T2-A] Task 2 — Incident Intake Form Component

**Status:** PARTIAL

**Cursor Mode:** Composer

**Date:** 2026-06-26

**Prompt Summary:** Build `IncidentForm.jsx` with validation, conditional file upload, axios submit, and success/error banners.

**Outcome:** Implemented `IncidentForm.jsx` with blur validation, conditional file upload by source type, character counter, submit disabled logic, `POST /api/tickets` integration, success/error banners, and form reset on success.

**Hallucinations / Issues:**
- `handleChange` for `sourceType` initially called `setFormData` twice, which could cause redundant state updates.

**Fix Applied:**
- Refactored `handleChange` to handle `sourceType` in a single state update and return early.

---

## [T2-B] Task 2 — App Router & Navigation

**Status:** WORKED

**Cursor Mode:** Composer

**Date:** 2026-06-26

**Prompt Summary:** Create `SubmitPage`, `DashboardPage` placeholder, `Navbar`, and `App.jsx` routing with `react-router-dom`.

**Outcome:** Created `SubmitPage.jsx`, `DashboardPage.jsx` (placeholder), `Navbar.jsx` with `NavLink` active styling, and updated `App.jsx` with routes for `/`, `/submit`, and `/dashboard`.

**Hallucinations / Issues:**
None observed.

**Fix Applied:**
No manual changes required.

---

## [T3-A] Task 3 — Flask API & Routing Engine

**Status:** PARTIAL

**Cursor Mode:** Composer

**Date:** 2026-06-26

**Prompt Summary:** Implement `router.py` priority engine and `app.py` POST/GET `/tickets` endpoints with JSON persistence.

**Outcome:** Rewrote `router.py` with `CRITICAL_KEYWORDS` and `assign_priority()`. Rewrote `app.py` with `load_tickets()`, `save_tickets()`, `POST /tickets`, `GET /tickets`, JSON error handlers, and CORS for the Vite dev origin.

**Hallucinations / Issues:**
- Replaced the Task 1 blueprint-based structure and removed the `/health` endpoint without an explicit request to keep it.
- Flask debug reloader restarted the server when E2E tests reset `tickets.json`, causing intermittent API failures.
- Direct API calls to `localhost:5000` failed on Windows when resolved to IPv6 `::1`.

**Fix Applied:**
- Added `use_reloader=False` to `app.run()` for E2E stability.
- Added `http://127.0.0.1:5173` to Flask-CORS origins.
- Playwright `api-client.ts` updated to use `127.0.0.1` for direct backend calls.

---

## [T3-B] Task 3 — Ticket Dashboard Component

**Status:** WORKED

**Cursor Mode:** Composer

**Date:** 2026-06-26

**Prompt Summary:** Build `TicketDashboard.jsx` with polling, priority filters, table display, and update `DashboardPage`.

**Outcome:** Implemented `TicketDashboard.jsx` with 5-second polling, All/Critical/Low filters, ticket count line, table with truncated descriptions, priority badges, row styling, loading spinner, error banner, and empty state. Updated `DashboardPage.jsx` to render the dashboard component.

**Hallucinations / Issues:**
None observed in the initial implementation.

**Fix Applied:**
No manual changes required for the initial component. (E2E test fixes for dashboard filtering were handled separately in the Playwright task.)

---

## [T4-A] Task 4 — Playwright Test Planning

**Status:** WORKED

**Cursor Mode:** Composer (Plan mode)

**Date:** 2026-06-26

**Prompt Summary:** Analyze the application and produce a Playwright E2E testing plan without writing code until approved.

**Outcome:** Delivered Phase 1 analysis covering testable pages, workflows, API endpoints, form fields, validations, dashboard behavior, untestable features, and a detailed framework plan (folder structure, page objects, test suites, fixtures, utilities).

**Hallucinations / Issues:**
None observed. The plan correctly identified missing `data-testid` attributes, shared `tickets.json` isolation risks, and sort order by `incident_date`.

**Fix Applied:**
No manual changes required.

---

## [T4-B] Task 4 — Playwright Framework Implementation

**Status:** PARTIAL

**Cursor Mode:** Composer

**Date:** 2026-06-26

**Prompt Summary:** Implement approved Playwright TypeScript framework with Page Object Model and tests for existing features only.

**Outcome:** Created `playwright/` directory with config, page objects, fixtures, utilities, 35 E2E tests across 5 spec files, HTML reporting, screenshots on failure, trace on retry, and `npm run test:e2e` script.

**Hallucinations / Issues:**
- Hardcoded ticket count assertions (`Showing 1 of 2 tickets`) failed when leftover tickets remained in `tickets.json`.
- Flask debug reloader and port 5173 conflicts caused flaky and failed test runs.
- `rowByReporterName` strict-mode violations when duplicate reporter names existed across test runs.

**Fix Applied:**
- Added explicit `resetTickets()` in filter and count tests with retry logic in `ticket-store.ts`.
- Replaced hardcoded counts with dynamic values from `getTickets()`.
- Set dashboard tests to serial mode.
- Added `strictPort: true` to Vite config.
- Used `.first()` for row locators and unique reporter names in rule-engine tests.

---

# Prompt Performance Summary

## Prompts That Worked Well

| Task | Prompt Objective | Why It Worked | Notes |
|------|------------------|---------------|-------|
| T1-B | Tailwind and Vite configuration | Exact file paths and config snippets were specified | No ambiguity about proxy rewrite or PostCSS plugins |
| T2-B | App router and navigation | Clear route map and component list | Output matched `react-router-dom` patterns already in dependencies |
| T3-B | Ticket dashboard component | Detailed UI requirements (columns, filters, polling interval) | Generated component matched spec without inventing features |
| T4-A | Playwright test planning | "Analyze first, do not write code" with approval gate | Prevented fake tests for unimplemented features |
| T2-A | Incident intake form | Field-level validation rules and API payload shape were explicit | Form behavior matched acceptance criteria closely |
| T1-A | Project scaffold | Sacred project structure and approved dependency list in rules | Minor template cleanup only |
| T3-A | Flask API and routing engine | Keyword list and endpoint contracts were fully specified | Priority engine logic matched requirements |

## Prompts That Required Manual Fixes

| Task | Issue | Cause | Improvement Made |
|------|-------|-------|------------------|
| T1-A | React 19 and extra deps from Vite template | `npm create vite` template not constrained in prompt | Specify exact package versions and forbidden packages in scaffold prompt |
| T2-A | Duplicate `setFormData` on source type change | Logic edge case not called out in prompt | Add "reset attachment when source type changes" as acceptance criterion |
| T3-A | `/health` endpoint removed during API rewrite | Task 3 prompt did not say to preserve scaffold endpoints | State which existing endpoints must remain when refactoring |
| T3-A | E2E failures from Flask reloader | File writes to `tickets.json` triggered debug reload | Document side effects of shared JSON storage in test prompts |
| T4-B | Filter test expected wrong ticket count | Hardcoded assertion; shared JSON state between runs | Use dynamic assertions from API response; require explicit test isolation |
| T4-B | `localhost` resolved to IPv6 on Windows | Environment-specific networking behavior | Use `127.0.0.1` for direct API calls in test utilities |

## Prompt Engineering Lessons Learned

1. **Break large tasks into smaller prompts** — Scaffold, form, API, dashboard, and tests were easier to verify independently than a single monolithic request.
2. **Specify exact file paths** — Paths like `frontend/src/components/IncidentForm.jsx` reduced misplaced or duplicate files.
3. **Analyze existing code before generating** — The Playwright plan-first approach avoided tests for nonexistent endpoints.
4. **Define acceptance criteria explicitly** — Validation messages, API payload fields, and sort behavior were testable because they were named in the prompt.
5. **Avoid assumptions about unimplemented features** — Stating "do not invent APIs" kept documentation and tests aligned with the codebase.
6. **Request validation rules verbatim** — Copying exact error strings into prompts produced matching UI behavior.
7. **Account for environment differences** — Windows PowerShell, IPv6 `localhost`, and OneDrive file sync affected commands and E2E stability.
8. **Plan test data isolation** — Shared `tickets.json` required reset utilities and serial test execution; this should be designed into the first test prompt.
9. **List approved dependencies** — Prevented template tools (e.g., `oxlint`) from entering the project.
10. **Use plan-then-approve for multi-file work** — Reduced rework on monorepo setup and Playwright framework generation.

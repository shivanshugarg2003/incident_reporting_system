# Docker & GitLab Deployment

## Quick Start (Local Docker)

```bash
# Build and run
docker-compose up --build

# Open the app
http://localhost:5000
```

`./data/tickets.json` is bind-mounted into the container and persists across rebuilds.

## Architecture

- **Single container** on port `5000`
- **Gunicorn** serves Flask (`app:app`)
- **React build** copied to `/app/static` inside the image
- **API** at `/tickets`
- **React Router** fallback via Flask catch-all route

## Rebuild After Changes

```bash
docker-compose up --build
```

## GitLab Container Registry

### Prerequisites

1. GitLab project with **Container Registry** enabled
2. Git remote pointing to your GitLab repository

### Push Code to GitLab

```bash
git init
git remote add origin https://gitlab.com/<group>/<project>.git
git add .
git commit -m "Add Docker and GitLab CI configuration"
git push -u origin main
```

### CI/CD Pipeline

The `.gitlab-ci.yml` pipeline:

1. Runs on pushes to the default branch and on tags
2. Builds the image using `backend/Dockerfile` (multi-stage)
3. Pushes to GitLab Container Registry as:
   - `$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA`
   - `$CI_REGISTRY_IMAGE:latest`

### Pull and Run from GitLab Registry

```bash
docker login registry.gitlab.com
docker pull registry.gitlab.com/<group>/<project>:latest

docker run -d \
  --name incident-app \
  -p 5000:5000 \
  -v "$(pwd)/data:/app/data" \
  -e DATA_DIR=/app/data \
  -e FLASK_ENV=production \
  registry.gitlab.com/<group>/<project>:latest
```

### Required GitLab CI Variables

No extra variables are required for registry push — GitLab provides:

- `CI_REGISTRY`
- `CI_REGISTRY_USER`
- `CI_REGISTRY_PASSWORD`
- `CI_REGISTRY_IMAGE`

Enable **GitLab Runner** with Docker executor (or use GitLab shared runners with `docker-in-docker`).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `../data` (local) / `/app/data` (Docker) | Directory containing `tickets.json` |
| `ALLOWED_ORIGIN` | `*` | CORS allowed origin |
| `FLASK_ENV` | — | Set to `production` in `docker-compose.yml` |
| `VITE_API_URL` | `""` | Optional API base URL for Vite dev builds |

## Local Development (Non-Docker)

```bash
npm run dev
```

Vite proxies `/tickets` to Flask on port `5000` for local development.

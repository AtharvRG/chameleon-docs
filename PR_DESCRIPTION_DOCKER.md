# PR: Add Dockerfile and Docker Compose for local development (Chameleon Docs)

## Title
Add optional containerized local development workflow using Docker + Docker Compose (Next.js + MongoDB) with dev + production-like parity stacks

---

## Executive Summary
This PR introduces an **enterprise-style, dev-first Docker workflow** for Chameleon Docs to improve:
- **Onboarding speed**: one-command bootstrapping of the full stack (web + MongoDB)
- **Consistency**: same Node + OS libraries across Windows/macOS/Linux
- **Reproducibility**: deterministic installs via `npm ci` and pinned base images
- **Resetability**: clean slate rebuilds with `docker compose down -v`

Scope is intentionally constrained:
- Docker is **optional**
- Existing non-Docker workflows remain unchanged
- No application logic or runtime behavior is modified

---

## Why Docker? (Problem → Solution)

Chameleon Docs is not just a static site: it includes authentication and database-backed features. Contributors often encounter:

1) **Environment drift**
   - different Node versions and OS toolchains can cause inconsistent behavior

2) **Database setup friction**
   - installing and configuring MongoDB locally is a common blocker for new contributors

3) **Reproducibility gaps**
   - issues can be hard to reproduce when local environments differ

4) **Hard resets**
   - a broken local install can cost significant time to repair

Docker solves this by containerizing the runtime and composing the dependent services.

---

## What This PR Adds

### 1) `Dockerfile` (multi-stage)
Adds a multi-stage Dockerfile with explicit targets:
- `dev` target:
  - runs `next dev` on `0.0.0.0:3000` for container-to-host access
  - optimized for hot reload + bind mounts
- `build` stage:
  - runs `npm run build` for Next.js production build output
- `prod` target:
  - runs `next start` for production-like parity checks
  - uses a slimmer runtime image (`node:<version>-bookworm-slim`)

Design highlights:
- cache-friendly dependency layer (copy `package*.json` first)
- deterministic dependency installs via `npm ci`
- telemetry disabled inside containers by default

### 2) `docker-compose.yml` (dev-first stack)
Orchestrates the local dev stack:
- `mongo` (MongoDB) with persistence volume
- `web` (Next.js) in dev mode with:
  - bind mount for live code edits
  - named volume for `node_modules` (OS-agnostic, avoids host conflicts)
  - named volume for `.next` cache (faster incremental builds)
  - healthchecks and deterministic startup ordering (mongo → web)

### 3) `docker-compose.prod.yml` (production-like parity stack)
Optional parity stack:
- uses Dockerfile `prod` target (`next start`)
- no bind mounts (closer to deployed behavior)
- still includes MongoDB for a realistic local runtime composition

### 4) `.env.example` (developer-friendly defaults)
Adds a template aligned with Next.js conventions:
- encourages copying to `.env.local`
- includes placeholders for:
  - `MONGODB_URI`
  - `AUTH_SECRET`
  - `GOOGLE_API_KEY` (optional)
  - `NEXT_PUBLIC_APP_URL`

### 5) `.dockerignore`
Keeps Docker builds faster and safer by excluding:
- `node_modules`, `.next`, env files, VCS metadata, etc.

### 6) `docker_guide.md` + README integration
Adds comprehensive documentation:
- benefits and comparison table (Docker vs traditional setup)
- dev vs production-like workflows
- architecture overview
- command reference and troubleshooting

README now includes a **Docker (Optional)** section and links to `docker_guide.md`.

---

## How to Use

### Dev workflow (recommended)
```bash
docker compose up --build
```

Open:
- App: `http://localhost:3000`

Stop:
```bash
docker compose down
```

Reset DB + volumes:
```bash
docker compose down -v
```

### Production-like parity workflow (optional)
```bash
docker compose -f docker-compose.prod.yml up --build
```

---

## Files Added / Updated

| File | Change Type | Purpose |
|------|------------:|---------|
| `Dockerfile` | Added | Multi-stage image (`dev` + `prod`) |
| `.dockerignore` | Added | Lean build context and safer builds |
| `.env.example` | Added | Env template aligned with `.env.local` |
| `docker-compose.yml` | Added | Dev stack: MongoDB + Next.js dev server |
| `docker-compose.prod.yml` | Added | Prod-like stack: MongoDB + `next start` |
| `docker_guide.md` | Added | Detailed Docker documentation |
| `README.md` | Updated | Docker quickstart + guide link |

---

## Validation

- `docker compose config`
- `docker compose -f docker-compose.prod.yml config`
- `docker compose build --no-cache` (verifies Dockerfile + dependency install)

---

## Suggested Labels
- `ECWoC26`
- `Improvements`
- `docker`
- `enhancement`


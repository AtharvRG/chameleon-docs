# 🐳 Docker Setup Guide - Enterprise-Grade Local Development (Chameleon Docs)

<div align="center">

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

Optional, dev-first Docker workflow for consistent onboarding and reproducible local development.

[Quick Start](#-quick-start) • [Architecture](#-architecture-overview) • [Dev vs Prod](#-dev-vs-production-like-stacks) • [Commands](#-command-reference) • [Troubleshooting](#-troubleshooting)

</div>

---

## ⚡ Why Docker? (Benefits + Comparison)

Chameleon Docs is a Next.js App Router application with MongoDB and authentication. Local setup often suffers from:
- Node + dependency drift across machines
- MongoDB installation friction (local installs, services, ports)
- inconsistent dev behavior across Windows/macOS/Linux
- harder resets when local environments get “dirty”

Docker standardizes the runtime so contributors can focus on building features, not debugging setup.

### Traditional vs Docker (Local Dev)

| Category | Traditional Setup | Docker Setup | Practical Advantage |
|---------:|-------------------|-------------|---------------------|
| Setup time | Install Node + MongoDB + deps | `docker compose up --build` | Faster onboarding |
| Consistency | Varies by OS and toolchain | Same container runtime | Reduced environment drift |
| Dependency isolation | Host installs can conflict | Dependencies isolated per container | Fewer local conflicts |
| Database provisioning | Manual DB install/config | MongoDB service included | Zero local DB setup |
| Resetability | Manual cleanup | `docker compose down -v` | Clean slate in one command |
| Reproducibility | Harder to match environments | Dockerfile + pinned images | Easier bug reproduction |

---

## 📊 Executive Summary

This repo includes an **optional** containerized local development setup:
- `docker-compose.yml` (dev-first): runs MongoDB + Next.js dev server with hot reload
- `docker-compose.prod.yml` (optional): runs a production-like Next.js `start` target for parity checks
- `Dockerfile`: multi-stage build with `dev` and `prod` targets

This setup is **non-intrusive**:
- does not change existing workflows (`npm run dev` still works)
- does not change application logic or runtime behavior

---

## ✅ Prerequisites

- Docker Desktop (Windows/macOS) OR Docker Engine (Linux)
- Docker Compose v2 (`docker compose ...`)

Verify:
```bash
docker --version
docker compose version
```

---

## 🚀 Quick Start

### 1) Create a local env file (recommended)

Copy the template:
```bash
cp .env.example .env.local
```

Update values in `.env.local` as needed (especially `AUTH_SECRET` and `GOOGLE_API_KEY`).

### 2) Start the dev stack
```bash
docker compose up --build
```

Open:
- App: http://localhost:3000

Stop:
```bash
docker compose down
```

Reset DB + volumes:
```bash
docker compose down -v
```

---

## 🧩 Dev vs Production-like Stacks

### Dev stack (`docker-compose.yml`)
Best for daily development:
- bind mounts for instant code updates
- Docker volumes for `node_modules` (OS-agnostic installs)
- Docker volume for `.next` cache (faster incremental rebuilds)
- healthchecks + deterministic startup ordering (mongo → web)

```bash
docker compose up --build
```

### Production-like stack (`docker-compose.prod.yml`)
Best for parity checks:
- no bind mounts (closer to a deployed container)
- `web` uses Dockerfile `prod` target (`next start`)
- helpful for verifying production bundles locally

```bash
docker compose -f docker-compose.prod.yml up --build
```

---

## 🏗️ Architecture Overview

```
Docker Host (Your OS)
  ├── http://localhost:3000  ->  web   (Next.js)
  └── mongodb://localhost:27017 -> mongo (MongoDB)

Inside Docker network:
  web connects to mongo via hostname "mongo"
```

---

## 🧱 Dockerfile Design (Multi-Stage Builds)

`Dockerfile` targets:
- `dev`:
  - Runs `next dev` with `--hostname 0.0.0.0` so the host can access it
  - Designed for hot reload + bind mounts
- `prod`:
  - Builds via `next build` and runs via `next start`
  - Uses a slimmer runtime image for reduced footprint

Layering choices:
- `package*.json` copied first for maximum cache efficiency
- `npm ci` used for reproducible dependency installs

---

## 📦 Volume Strategy (Cross-Platform Reliability)

The dev compose stack separates:
- Source code (bind mount): `./:/app` for fast edits
- Dependencies (named volume): `/app/node_modules` to avoid Windows/macOS file share issues
- Next cache (named volume): `/app/.next` for faster rebuilds and stable caching

---

## 🔐 Environment Variables

This project expects environment variables via `.env.local` (standard Next.js convention).

Template:
- `.env.example`

Key variables:
- `MONGODB_URI` (points to `mongo` inside Docker)
- `AUTH_SECRET` (NextAuth secret)
- `GOOGLE_API_KEY` (optional AI integration)
- `NEXT_PUBLIC_APP_URL` (public URL for auth callbacks/links)

---

## 🎮 Command Reference

```bash
# Dev stack
docker compose up --build
docker compose up -d --build
docker compose logs -f
docker compose ps
docker compose down
docker compose down -v

# Production-like stack
docker compose -f docker-compose.prod.yml up --build
docker compose -f docker-compose.prod.yml down
```

---

## 🐛 Troubleshooting

### Docker engine not running (Windows)
If you see errors about `dockerDesktopLinuxEngine`, start Docker Desktop and ensure the Linux engine is running (WSL2 recommended).

### Ports already in use
If `3000` or `27017` are occupied:
- stop the conflicting process, or
- change the host port mapping in `docker-compose.yml`

If MongoDB is already running locally on `27017`, start compose on a different host port:
```powershell
$env:MONGO_PORT=27018; docker compose up --build
```

### File watching is unreliable on Docker Desktop
The dev stack sets `WATCHPACK_POLLING=true` to improve reliability on file shares.

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-20  
**Scope:** local development tooling only (optional, non-intrusive)

# Chameleon Docs Dockerfile (Next.js App Router + MongoDB)
#
# Goals:
# - Optional, dev-first container workflow for contributors
# - Reproducible installs (npm ci) + cache-friendly layering
# - Multi-stage targets for dev and production-like parity
#
# Targets:
# - dev  : next dev (port 3000) for local development
# - prod : next start (port 3000) for production-like checks

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm AS base

WORKDIR /app

# Keep Next.js telemetry off inside containers by default.
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

# Copy package metadata first to leverage Docker layer caching.
COPY package*.json ./

# Deterministic dependency install from lockfile.
RUN npm ci --no-audit --no-fund

FROM base AS dev

# Reuse dependencies from deps stage.
COPY --from=deps /app/node_modules /app/node_modules

# Copy source (compose also bind-mounts for live reload).
COPY . .

EXPOSE 3000

# Bind to 0.0.0.0 so the host can access the container port.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# -----------------------------------------------------------------------------
# Production-like target (parity checks / CI)
# -----------------------------------------------------------------------------

FROM base AS build

ENV NODE_ENV=production

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

RUN npm run build

FROM node:${NODE_VERSION}-bookworm-slim AS prod

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/next.config.mjs /app/next.config.mjs

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]

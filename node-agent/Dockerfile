# Production-only Dockerfile. In dev we run `pnpm dev` on the host
# (`make dev-node`). CI builds this image as a sanity check.

FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable

# ── Build stage: install + transpile ─────────────────────────────────────────
FROM base AS build

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# ── Runtime stage: prod deps only ────────────────────────────────────────────
FROM base AS runtime

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]

# Built from the repo root: docker compose passes the whole workspace as context, because pnpm
# workspace links mean a single app cannot be installed in isolation.
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
# Native builds (argon2, prisma engines) need a toolchain that the runtime image does not.
RUN apk add --no-cache python3 make g++ openssl
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/runner/package.json packages/runner/
COPY packages/content/package.json packages/content/
COPY packages/db/prisma packages/db/prisma
COPY packages/db/prisma7.config.ts packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts=false

FROM deps AS build
COPY . .
RUN pnpm --filter @code-lift/shared build \
 && pnpm --filter @code-lift/runner build \
 && pnpm --filter @code-lift/db build \
 && pnpm --filter @code-lift/content build \
 && pnpm --filter @code-lift/api build

FROM base AS runtime
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3334
# Migrations and content sync run on boot so `docker compose up` on a clean volume is enough.
CMD ["sh", "-c", "pnpm --filter @code-lift/db run db:deploy && pnpm --filter @code-lift/api run db:seed && pnpm --filter @code-lift/content run sync && node dist/main.js"]

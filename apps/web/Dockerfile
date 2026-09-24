FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/runner/package.json packages/runner/
COPY packages/ui/package.json packages/ui/
COPY packages/db/prisma packages/db/prisma
COPY packages/db/prisma7.config.ts packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts=false

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3334
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @code-lift/shared build \
 && pnpm --filter @code-lift/runner build \
 && pnpm --filter @code-lift/web build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/web
EXPOSE 3010
CMD ["pnpm", "exec", "next", "start", "--port", "3010", "--hostname", "0.0.0.0"]

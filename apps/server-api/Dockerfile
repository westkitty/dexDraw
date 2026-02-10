FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy package manifests
COPY packages/shared-protocol/package.json packages/shared-protocol/
COPY packages/shared-core/package.json packages/shared-core/
COPY apps/server-api/package.json apps/server-api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared-protocol/ packages/shared-protocol/
COPY packages/shared-core/ packages/shared-core/
COPY apps/server-api/ apps/server-api/

# Build
RUN pnpm --filter server-api build

# Production image
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/shared-protocol/package.json packages/shared-protocol/
COPY --from=builder /app/packages/shared-protocol/dist/ packages/shared-protocol/dist/
COPY --from=builder /app/packages/shared-core/package.json packages/shared-core/
COPY --from=builder /app/packages/shared-core/dist/ packages/shared-core/dist/
COPY --from=builder /app/apps/server-api/package.json apps/server-api/
COPY --from=builder /app/apps/server-api/dist/ apps/server-api/dist/

RUN pnpm install --prod --frozen-lockfile

EXPOSE 4000

CMD ["node", "apps/server-api/dist/index.js"]

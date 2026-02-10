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
# We build everything required for the server
RUN pnpm --filter @dexdraw/shared-core build
RUN pnpm --filter @dexdraw/shared-protocol build
RUN pnpm --filter @dexdraw/server-api build

# Phase 2: Production Runner
FROM node:22-alpine

WORKDIR /app

# Enable pnpm for production install
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only package.json files needed for production install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-protocol/package.json packages/shared-protocol/
COPY packages/shared-core/package.json packages/shared-core/
COPY apps/server-api/package.json apps/server-api/

# Install ONLY production dependencies
# This keeps the image size small
RUN pnpm install --prod --frozen-lockfile --filter @dexdraw/server-api...

# Copy built artifacts from builder
# We need the dist folders from shared packages as well since they are dependencies
COPY --from=builder /app/packages/shared-protocol/dist/ packages/shared-protocol/dist/
COPY --from=builder /app/packages/shared-core/dist/ packages/shared-core/dist/
COPY --from=builder /app/apps/server-api/dist/ apps/server-api/dist/

# Expose API port
EXPOSE 4000

# Set Node environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "apps/server-api/dist/index.js"]

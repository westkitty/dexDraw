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
COPY apps/client-web/package.json apps/client-web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared-protocol/ packages/shared-protocol/
COPY packages/shared-core/ packages/shared-core/
COPY apps/client-web/ apps/client-web/

# Build
RUN pnpm --filter client-web build

# Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/client-web/dist /usr/share/nginx/html

# SPA fallback: redirect all routes to index.html
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

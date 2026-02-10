FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy package manifests (preserve directory structure)
COPY packages/shared-protocol/package.json packages/shared-protocol/
COPY packages/shared-core/package.json packages/shared-core/
COPY apps/client-web/package.json apps/client-web/
# Server API not needed for client build

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared-protocol/ packages/shared-protocol/
COPY packages/shared-core/ packages/shared-core/
COPY apps/client-web/ apps/client-web/

# Build the client
# Filtering by package name ensures we only build what is needed
RUN pnpm --filter client-web build

# Phase 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/apps/client-web/dist /usr/share/nginx/html

# Custom Nginx config to handle SPA routing (rewrites to index.html)
RUN echo 'server { \
  listen 5173; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
  try_files $uri $uri/ /index.html; \
  } \
  }' > /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]

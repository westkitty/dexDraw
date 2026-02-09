# dexDraw

Shared real-time whiteboard for business meetings.

## Supported Browsers

- Brave (Chromium) on macOS
- Firefox on macOS

## UI Standard

Dark Mode default with High Contrast.

## Architecture

- **Collaboration model**: Server-authoritative ordered operation log for board objects; Yjs CRDT for text content.
- **Transport**: WebSocket with heartbeat managed in a dedicated Web Worker. HTTP long-poll fallback for corporate firewalls.
- **Reconnect invariant**: Client handshakes with `lastSeenServerSeq`; server replays ops since; client resends Outbox; server dedupes by `(clientId, clientSeq)`.
- **Ink pipeline**: Shared-core normalization (resample, quantize, velocity pressure shim, perfect-freehand) producing polygon points rendered via Canvas fill.

## Monorepo Structure

```
apps/
  client-web/     React + Vite + TypeScript
  server-api/     Node + Fastify + ws + PostgreSQL
packages/
  shared-protocol/  Zod schemas + wire helpers
  shared-core/      Deterministic math/geometry, stroke normalization
docs/
  adr/              Architecture Decision Records
tools/
  load/             Load testing utilities
```

## Development

```bash
pnpm install
pnpm dev       # starts client + server concurrently
pnpm test      # runs all tests
pnpm typecheck # TypeScript project-wide check
pnpm lint      # Biome lint + format check
```

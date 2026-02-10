# Changelog

All notable changes to dexDraw are documented in this file.

## [0.1.0-meeting] - 2026-02-09

First meeting-ready release of dexDraw, a shared real-time whiteboard for business meetings.

### Added

#### Foundation
- Monorepo with pnpm workspaces: `apps/client-web`, `apps/server-api`, `packages/shared-protocol`, `packages/shared-core`
- Strict TypeScript with composite project references
- Biome for linting and formatting

#### Protocol & Core
- Versioned envelope schema with durable, ephemeral, and hybrid message types
- Zod-validated schemas for all operations (createObject, updateObject, deleteObject, undo, redo, checkpoints)
- Deterministic stroke normalization pipeline: resample, quantize, velocity-pressure shim, polygon generation
- Wire encoding/decoding with direction-aware validation (c2s/s2c)

#### Client (`apps/client-web`)
- React 19 + Vite 6 with dark mode default
- Multi-layer canvas rendering (background, committed, active stroke, selection)
- High-fidelity ink input with `getCoalescedEvents()` and `perfect-freehand`
- Zustand + immer state management
- Web Worker-based WebSocket transport with heartbeat and exponential backoff
- HTTP long-poll fallback after 3 failed WS attempts
- IndexedDB outbox for offline op persistence and reconnect resync
- Object model: strokes, shapes, text with selection, move, resize, rotate
- Undo/redo via inverse op dispatch
- Yjs CRDT text editing with multiplexed sub-channels
- Presence: remote cursors (20Hz), laser pointer, follow mode
- Ink-to-text: lasso selection, TF.js worker stub, server OCR fallback
- Checkpoint creation/restoration and timeline scrubber for time-travel replay
- Comment pins with threaded replies, resolve/unresolve
- Parking lot for off-canvas item management
- Export: PNG (viewport/full), PDF (jsPDF), Markdown meeting summary
- Board templates: Blank, SWOT, Kanban, Agenda

#### Server (`apps/server-api`)
- Fastify 5 with `@fastify/websocket`, structured pino logging
- Server-authoritative op ordering with `serverSeq` assignment
- Idempotent op processing via `(clientId, clientSeq)` deduplication
- Room lifecycle with 30s grace period on last client leave
- Snapshot creation every 50 ops
- PostgreSQL persistence via Drizzle ORM (boards, ops, snapshots, yjs_updates, checkpoints)
- Yjs update persistence keyed by `{boardId, textObjectId, serverSeqRef}`
- JWT board tokens with role-based access (view/comment/edit)
- Per-op role enforcement, rate limiting (100 ops/s/client), payload size limits (1MB)
- Object count cap (500/board), batch size limits
- CSP headers via `@fastify/helmet`
- REST APIs: boards, templates, checkpoints, replay, auth, health, metrics

#### Testing
- 115 unit tests across all packages (Vitest)
- Schema validation, geometry, math, store, replay engine, comments, exports, security
- Playwright config for Chromium + Firefox e2e
- k6 load test (10 concurrent users) and chaos/disconnect test scripts

#### Deployment
- Docker Compose with server, client, postgres, nginx services
- Multi-stage Dockerfiles for client (nginx serving) and server
- Nginx reverse proxy with WebSocket upgrade support
- Health endpoint with uptime, `/metrics` with room/client/memory stats

#### Documentation
- Meeting-ready acceptance suite (10 scripted scenarios)
- ADR directory for architectural decisions

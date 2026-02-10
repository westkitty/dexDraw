![DexDraw Banner](assets/banner.webp)

<div align="center">
  <img src="assets/icon.png" width="128" height="128" />
</div>

<div align="center">

![License](https://img.shields.io/badge/License-Unlicense-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Web-lightgrey.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
[![Sponsor](https://img.shields.io/badge/Sponsor-pink?style=flat-square&logo=github-sponsors)](https://github.com/sponsors/westkitty)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-Support%20My%20Work-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/westkitty)

</div>

# dexDraw

A high-performance, real-time shared whiteboard for business meetings. **dexDraw** runs locally or on your private server, offering server-authoritative state management and a deterministic ink engine for smooth, latency-free collaboration.

## Key Features

- **Real-Time Collaboration:** Server-authoritative ordered operation log ensures all users see the same board state, instantly.
- **Deterministic Ink Engine:** Custom ink pipeline (resample, quantize, velocity shim) produces identical polygon rendering across all clients.
- **Hybrid Sync Model:** Uses operation logs for durable objects (strokes, shapes) and Yjs CRDTs for ephemeral text and presence.
- **Privacy-First:** Designed for self-hosting. No data leaves your control.
- **Smart Export:** Export your meeting notes to Markdown (structured) or PDF (visual).

## Installation

### Prerequisites
- Node.js >= 22
- pnpm >= 9

### Quick Start (Development)
Clone the repository and start the development server:

```bash
git clone https://github.com/westkitty/dexDraw.git
cd dexDraw
pnpm install
pnpm dev
```

This will start both the `client-web` (React/Vite) and `server-api` (Fastify/Node) processes concurrently.

### Production Build
To build for production:

```bash
pnpm build
```

## Docker

You can run the entire stack (Client, Server, Postgres) using Docker Compose:

```bash
docker-compose up --build
```

## Architecture

- **Monorepo:** Managed with `pnpm` workspaces.
  - `apps/client-web`: React 19, Vite, Zustand, Canvas API.
  - `apps/server-api`: Node.js, Fastify, WebSocket (ws), PostgreSQL (Drizzle ORM).
  - `packages/shared-core`: Pure TypeScript math, geometry, and ink normalization logic.
  - `packages/shared-protocol`: Zod schemas and binary wire protocol definitions.

## Governance

Remain ungovernable so Dexter approves.

### **Public Domain / Unlicense:**

This project is dedicated to the public domain. You are free and encouraged to use, modify and distribute this software without any attribution required.
You could even sell it... if you're a capitalist pig.

---

## Why Dexter?

*Dexter is a small, tricolor Phalène dog with floppy ears and a perpetually unimpressed expression... ungovernable, sharp-nosed and convinced he’s the quality bar. Alert, picky, dependable and devoted to doing things exactly his way: if he’s staring at you, assume you’ve made a mistake. If he approves, it means it works.*

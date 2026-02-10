# DexDraw: Exhaustive Setup & Architecture Guide

## 1. Project Overview

**dexDraw** is a shared real-time whiteboard built for speed, determinism, and privacy. It uses a custom ink engine to ensure that every participant sees the exact same drawing fidelity, regardless of their device or network speed.

### Core Philosophy
- **Local-First / Self-Hosted:** No cloud dependency.
- **Server-Authoritative:** The server is the source of truth for the operation log.
- **Deterministic Rendering:** Inputs are normalized (resampled, quantized) before they hit the canvas.

---

## 2. Installation & Setup

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v22 or higher)
- **pnpm** (v9 or higher) - *We use pnpm workspaces extensively.*
- **PostgreSQL** (Optional for dev, required for prod persistence)

### Step-by-Step Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/westkitty/dexDraw.git
    cd dexDraw
    ```

2.  **Install Dependencies**
    ```bash
    pnpm install
    ```
    *Note: This installs dependencies for the root and all workspaces (`apps/*`, `packages/*`).*

3.  **Environment Configuration**
    Create a `.env` file in `apps/server-api` if you need custom database settings. By default, development uses in-memory or local SQLite fallbacks where applicable (check `apps/server-api/src/config`).

4.  **Start Development Server**
    ```bash
    pnpm dev
    ```
    This command runs `turbo run dev` equivalent, starting:
    -   **Client:** `http://localhost:5173` (Vite)
    -   **Server:** `http://localhost:3000` (Fastify)

---

## 3. Architecture Deep Dive

### Monorepo Structure
The project is organized as a monorepo to share code between the client and server.

-   **`packages/shared-core`**: The brain. Contains pure functions for geometry, math, and the ink normalization pipeline. This code runs on both client (for prediction) and server (for validation).
-   **`packages/shared-protocol`**: The language. Contains Zod schemas for every message type (JoinRequest, CreateObjectOp, etc.) and binary encoders/decoders.
-   **`apps/client-web`**: The face. A React 19 application using Zustand for state and a raw HTML5 Canvas for high-performance rendering.
-   **`apps/server-api`**: The nervous system. A Fastify WebSocket server that maintains the canonical operation log and broadcasts patches to connected clients.

### The Ink Pipeline
1.  **Raw Input:** Pointer events (`pointerdown`, `pointermove`) are captured.
2.  **Normalization:** Points are resampled to a constant distance (e.g., 5px) to smooth out jitter.
3.  **Quantization:** Coordinates are rounded to a grid (e.g., 0.5px) to ensure determinism across different floating-point implementations.
4.  **rendering:** The `perfect-freehand` algorithm generates a polygon from the normalized points, which is filled on the canvas.

---

## 4. Contributing

We maintain a high standard of code quality.

-   **Linting:** Run `pnpm lint` before committing. We use Biome.
-   **Testing:** Run `pnpm test` to execute the Vitest suite. All core logic is covered.
-   **Commits:** Use semantic commit messages (e.g., `feat: add lasso tool`, `fix: resolving stroke jitter`).

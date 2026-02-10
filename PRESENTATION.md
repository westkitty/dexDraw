# DexDraw: Exhaustive Setup & Architecture Guide

## 1. Project Overview

**DexDraw** is a shared real-time whiteboard built for speed, determinism, and privacy. It uses a custom ink engine to ensure that every participant sees the exact same drawing fidelity, regardless of their device or network speed.

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

    -   **Server:** `http://localhost:3000` (Fastify)

---

## 3. Docker Deployment (Recommended)

For the most reliable experience, we recommend running DexDraw in Docker. This ensures all dependencies (Node, Postgres, Nginx) are configured exactly as intended.

### 3.1 Prerequisites
-   **Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
-   **Computed RAM**: Allocate at least 4GB of RAM to Docker for building.

### 3.2 Step-by-Step Guide

1.  **Clone the Repo (if you haven't already)**
    ```bash
    git clone https://github.com/westkitty/dexDraw.git
    cd dexDraw
    ```

2.  **Build and Run**
    Run the following command in your terminal. This will download the base images, build the application code, and start the services.
    ```bash
    docker-compose up --build
    ```
    *Note: The first build may take 3-5 minutes as it installs dependencies.*

3.  **Access the Application**
    Once the logs show "Server listening at http://0.0.0.0:4000", open your browser:
    -   **Frontend**: [http://localhost:3000](http://localhost:3000)
    -   **API**: [http://localhost:4000](http://localhost:4000)
    -   **Tailscale**: If running with `TS_AUTHKEY`, access via your MagicDNS name (e.g., `http://dexdraw-server`).

### 3.3 Managing the Containers

-   **Stop the App**: Press `Ctrl+C` in the terminal.
-   **Run in Background**: Use the detached mode flag `-d`:
    ```bash
    docker-compose up -d
    ```
-   **View Logs (Detached)**:
    ```bash
    docker-compose logs -f
    ```
-   **Stop and Remove**:
    ```bash
    docker-compose down
    ```

### 3.4 Troubleshooting

**"Bind for 0.0.0.0:3000 failed: port is already allocated"**
> This means another program is using port 3000. Stop other apps or modify `docker-compose.yml` to map to a different port (e.g., `'3001:80'`).

**"Connection refused to postgres"**
> The server might start before the database is ready. The `depends_on` condition in our compose file handles this, but if it fails, simply restart the containers: `docker-compose restart server`.

**"Tailscale won't connect"**
> Ensure your `TS_AUTHKEY` is valid and reusable if you plan to restart often. Check logs with `docker-compose logs tailscale`.

**"Tailscale won't connect"**
> Ensure your `TS_AUTHKEY` is valid and reusable if you plan to restart often. Check logs with `docker-compose logs tailscale`.

---

## 4. Native Tailscale Integration

DexDraw is designed to be "Tailscale Native". If you run it locally without Docker, it will automatically bind to your Tailscale interface.

### How to use:
1.  Ensure Tailscale is installed and running on your Mac/PC.
2.  Run `pnpm dev`.
3.  On any other device in your Tailnet (e.g., iPad, Phone), navigate to:
    `http://<YOUR-MACHINE-TAILSCALE-IP>:3000`
    or
    `http://<YOUR-MACHINE-NAME>:3000` (MagicDNS)

### Sharing via Funnel
If you need to share with someone *outside* your Tailnet:
```bash
tailscale funnel 3000
```
This will give you a public URL (e.g., `https://my-machine.tailnet.ts.net`) that routes securely to your local DexDraw instance.

---

## 5. Architecture Deep Dive

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

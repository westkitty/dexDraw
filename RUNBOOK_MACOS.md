# DexDraw: macOS + Tailscale Runbook ("Bigmac" Edition)

## Objective
Run DexDraw (Web + API) on macOS host "bigmac" and access it securely via Tailscale.

## Prerequisites (Verified)
-   **Node.js**: v22+
-   **pnpm**: v9+ (Global)
-   **Tailscale**: v1.94+ (Logged in)

## The "Everything works" Command
We have added a deterministic start script that handles build order, ports, and networking.

1.  **Pull latest changes**:
    ```bash
    git pull
    pnpm install
    ```

2.  **Start the secure dev environment**:
    ```bash
    pnpm dev:tailnet
    ```

## What this does (Under the hood)
1.  **Builds Shared Code**: Runs `pnpm build` on `packages/*` to ensure dependencies resolve.
2.  **Starts API**: Runs `pnpm dev:server` (Port 4000).
3.  **Starts Web**: Runs `pnpm dev:client` (Port 5173).
4.  **Configures Tailscale**:
    -   Binds `tailscale serve` to local port 5173.
    -   Enables HTTPS on your tailnet URL (e.g., `https://bigmac.tailafb7e8.ts.net`).

## Architecture Fixes Applied
-   **Vite**: Configured to allow Tailscale host headers (`allowedHosts`).
-   **Ports**: Standardized on 5173 (Web) and 4000 (API).
-   **Proxy**: Web client correctly proxies `/api` and `/ws` requests to localhost:4000, avoiding CORS/Mixed-Content issues.

## Troubleshooting
-   **"No serve config"**: Run `tailscale serve status`. If empty, the script will auto-configure it.
-   **Logs**: Check `/tmp/dexdraw-api.log` and `/tmp/dexdraw-web.log`.
-   **Stop**: Press `Ctrl+C` to stop all services.

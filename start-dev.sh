#!/bin/bash
set -e

# 1. Build shared packages once to ensure artifacts exist
echo "📦 Building shared packages..."
pnpm --filter "./packages/**" build

# 2. Start Services in Background
# We use a trap to kill background processes on exit
trap 'kill $(jobs -p)' EXIT

echo "🚀 Starting Server (API)..."
pnpm dev:server > /tmp/dexdraw-api.log 2>&1 &
SERVER_PID=$!

echo "🚀 Starting Client (Web)..."
pnpm dev:client > /tmp/dexdraw-web.log 2>&1 &
CLIENT_PID=$!

# 3. Wait for services to be up
echo "⏳ Waiting for services to listen..."
# Simple wait loop for port 5173 (Web) and 4000 (API)
while ! nc -z localhost 5173; do sleep 1; done
while ! nc -z localhost 4000; do sleep 1; done

echo "✅ Services are UP:"
echo "   - Web: http://localhost:5173"
echo "   - API: http://localhost:4000"

# 4. Configure Tailscale Serve
# Check if we need to reset/configure
echo "🔧 Configuring Tailscale Serve..."
# Use the syntax confirmed to work on this host: port-only
tailscale serve --yes --bg 5173

echo "🎉 DexDraw is running!"
echo "   Tailnet URL: $(tailscale serve status | grep https:// | head -n1 | awk '{print $1}')"
echo "   Logs: tail -f /tmp/dexdraw-*.log"
echo ""
echo "Press Ctrl+C to stop."

wait

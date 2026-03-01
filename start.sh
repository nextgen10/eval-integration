#!/usr/bin/env bash
# ============================================================
# Qualaris Unified Startup Script
# Starts all services needed for the unified platform:
#   1. Qualaris backend (includes Playwright POM routers) → port 8000
#   2. Qualaris Next.js frontend → port 3000
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║         QUALARIS — Unified Platform Startup      ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Qualaris backend (port 8000) ──────────────────────────
echo "▶  Starting Qualaris backend on :8000 ..."
cd "$ROOT_DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
MAIN_BACKEND_PID=$!
echo "   PID: $MAIN_BACKEND_PID"

# ── 2. Qualaris Next.js frontend (port 3000) ─────────────────
echo "▶  Starting Qualaris frontend on :3000 ..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

echo ""
echo "────────────────────────────────────────────────────"
echo "  All services are starting. Open in browser:"
echo "  → Qualaris UI:        http://localhost:3000"
echo "  → Unified API docs:   http://localhost:8000/docs"
echo "────────────────────────────────────────────────────"
echo "  Press Ctrl+C to stop all services."
echo ""

# Trap Ctrl+C and kill all background processes
trap 'echo ""; echo "Stopping all services..."; kill $MAIN_BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM

# Wait for all background processes
wait $MAIN_BACKEND_PID $FRONTEND_PID

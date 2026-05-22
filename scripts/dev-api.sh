#!/usr/bin/env bash
# Fast local API start — build once, then run without recompiling.
set -euo pipefail
export PATH="/usr/local/share/dotnet:${PATH:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="$ROOT/src/backend/Sorted.Api"

cd "$API"

echo "Shutting down stale build servers (fixes hung 'Building...')..."
dotnet build-server shutdown 2>/dev/null || true

echo "Building..."
dotnet build -c Debug

echo "Starting API on http://localhost:5080"
dotnet run -c Debug --no-build --urls "http://localhost:5080"

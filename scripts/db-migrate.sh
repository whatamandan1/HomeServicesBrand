#!/usr/bin/env bash
# Apply EF Core migrations locally (SQLite by default from appsettings.json).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${PATH}:${HOME}/.dotnet/tools"
cd "$ROOT/src/backend/Sorted.Api"
dotnet ef database update --project ../Sorted.Infrastructure --startup-project .

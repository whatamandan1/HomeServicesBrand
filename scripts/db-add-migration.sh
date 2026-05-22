#!/usr/bin/env bash
# Add a new EF Core migration. Requires dotnet-ef: dotnet tool install --global dotnet-ef
set -euo pipefail
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <MigrationName>"
  exit 1
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${PATH}:${HOME}/.dotnet/tools"
cd "$ROOT/src/backend"
dotnet ef migrations add "$1" --project Sorted.Infrastructure --startup-project Sorted.Api --output-dir Data/Migrations

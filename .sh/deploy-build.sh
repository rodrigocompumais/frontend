#!/usr/bin/env bash
# Deploy do frontend sem derrubar o site.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Deploy frontend (zero downtime)"
npm run build:live

echo ""
echo "==> Deploy concluído."
echo "    Compila em build-staging; publica ao final em build e build-live."
echo "    PM2 pode continuar com: serve -s build -l 3001"
echo ""
echo "    Rollback: npm run build:rollback"

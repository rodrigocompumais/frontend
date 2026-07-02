#!/usr/bin/env bash
# Deploy do frontend sem derrubar o site.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Deploy frontend (zero downtime)"
npm run build:live

echo ""
echo "==> Deploy concluído."
echo "    O processo de serve DEVE apontar para build-live, não build:"
echo "      serve -s build-live -l 3001"
echo ""
echo "    Se o PM2 ainda usa 'serve -s build', atualize uma vez:"
echo "      pm2 delete compumais-frontend 2>/dev/null || true"
echo "      pm2 start \"npx serve -s build-live -l 3001\" --name compumais-frontend --cwd \"$ROOT\""
echo ""
echo "    Rollback: npm run build:rollback"

#!/usr/bin/env bash
# Deploy do frontend sem derrubar o site (build em build-next + troca atômica).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Deploy frontend (zero downtime)"
npm run build:live

echo "==> Deploy concluído."
echo "    Se usar PM2 com serve, normalmente não precisa reiniciar."
echo "    Se algo falhar: npm run build:rollback"

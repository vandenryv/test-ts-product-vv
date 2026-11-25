#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

docker compose up -d --wait
npm run prisma:generate
set -a
source config/.env.development
set +a
npx prisma migrate deploy
DEV_WATCH_FLAG= npm run dev -- --import-json sample.json
exec npm run dev
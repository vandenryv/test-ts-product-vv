#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
set -a
source .env
set +a

npx prisma migrate dev "$@"
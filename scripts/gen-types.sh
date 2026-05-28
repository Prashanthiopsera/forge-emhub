#!/usr/bin/env bash
# Regenerate TypeScript types from local Supabase schema (WO-007).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/frontend/src/types/database.types.ts"

if ! command -v supabase >/dev/null 2>&1; then
  echo "ERROR: supabase CLI required. Install: https://supabase.com/docs/guides/cli" >&2
  exit 1
fi

cd "$ROOT/infra/supabase"
supabase gen types typescript --local > "$OUT"
echo "Wrote $OUT"

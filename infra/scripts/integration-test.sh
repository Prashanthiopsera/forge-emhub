#!/usr/bin/env bash
#
# Boots a local Supabase stack via the Supabase CLI, runs the WO-001 integration test,
# and tears the stack down.
#
# Requires:
#   - Docker (Desktop or daemon) running
#   - Supabase CLI installed: https://supabase.com/docs/guides/cli
#   - npm install (vitest is a dev dep at the repo root)
#
# Usage:
#   ./infra/scripts/integration-test.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SUPABASE_DIR="$REPO_ROOT/infra/supabase"

cleanup() {
  echo ""
  echo "↓ Stopping local Supabase…"
  (cd "$SUPABASE_DIR" && supabase stop --no-backup) || true
}
trap cleanup EXIT

echo "→ Starting local Supabase (config: $SUPABASE_DIR/config.toml)…"
(cd "$SUPABASE_DIR" && supabase start)

# `supabase status -o env` emits KEY=value lines for SUPABASE_URL, SUPABASE_ANON_KEY, etc.
echo "→ Loading env from supabase status…"
STATUS_ENV="$(cd "$SUPABASE_DIR" && supabase status -o env)"
# shellcheck disable=SC2046
export $(echo "$STATUS_ENV" | xargs)

# The CLI prints API_URL / ANON_KEY by default; map them onto the names the test expects.
export SUPABASE_URL="${API_URL:-${SUPABASE_URL:-http://127.0.0.1:54321}}"
export SUPABASE_ANON_KEY="${ANON_KEY:-${SUPABASE_ANON_KEY:-}}"

if [ -z "${SUPABASE_ANON_KEY}" ]; then
  echo "ERROR: SUPABASE_ANON_KEY was not exported by supabase status" >&2
  exit 1
fi

echo "→ Running integration test…"
(cd "$REPO_ROOT" && npx vitest run infra/tests/supabase-health.test.mjs)

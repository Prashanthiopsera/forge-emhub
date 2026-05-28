#!/usr/bin/env bash
# Integration test: apply migrations + seed on local Supabase (WO-005).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SUPABASE_DIR="$ROOT/infra/supabase"

if ! command -v supabase >/dev/null 2>&1; then
  echo "SKIP: supabase CLI not installed — run schema-config unit tests only." >&2
  exit 0
fi

cd "$SUPABASE_DIR"
echo "Running supabase db reset (migrations + seed)..."
supabase db reset --yes

echo "Verifying core tables..."
psql "$(supabase status -o env 2>/dev/null | grep DATABASE_URL | cut -d= -f2- | tr -d '"')" -v ON_ERROR_STOP=1 <<'SQL'
SELECT COUNT(*) AS departments FROM public.departments;
SELECT COUNT(*) AS profiles FROM public.profiles;
SELECT COUNT(*) AS templates FROM public.onboarding_templates;
SELECT COUNT(*) AS faq_articles FROM public.faq_articles;
SQL

echo "Schema migration integration test passed."

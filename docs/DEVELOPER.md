# Developer Guide (WO-042)

## Quick start

```bash
git clone https://github.com/Prashanthiopsera/forge-emhub.git
cd forge-emhub
npm install
# From repo root (CLI workdir is infra/, config is infra/supabase/config.toml):
npm run supabase:start
npm run supabase:status    # prints API_URL and ANON_KEY

cp frontend/.env.example frontend/.env.local
# Paste API_URL → VITE_SUPABASE_URL and ANON_KEY → VITE_SUPABASE_ANON_KEY from status output.
# Do not paste comment lines (lines starting with #) into the terminal.

npm run supabase:reset     # migrations + seed
npm run dev
```

App: http://localhost:5173 — seed users `alex.newhire@emhub.local` / `EmhubDev123!`

## Structure

- `frontend/` — React 18 + Vite + TypeScript + Tailwind
- `infra/supabase/` — migrations, seed, Edge Functions
- `infra/cloudflare/` — CDN/WAF Terraform
- `e2e/` — Playwright journeys (WO-037)

## Conventions

- Feature folders under `frontend/src/features/<name>/`
- Hooks: `use*.ts`, logic in `*.logic.ts`, fixtures for tests
- One Forge work order per commit (`[WO-<uuid>]` prefix)

## Migrations

```bash
cd infra/supabase
supabase db reset    # applies migrations + seed
npm run gen:types    # from repo root
```

## Tests

```bash
npm test                  # unit + config
npm run test:integration  # requires Docker + Supabase CLI
npx playwright test       # E2E (WO-037)
```

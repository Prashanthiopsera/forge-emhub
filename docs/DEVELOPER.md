# Developer Guide (WO-042)

## Quick start

```bash
git clone https://github.com/Prashanthiopsera/forge-emhub.git
cd forge-emhub
npm install
cd infra/supabase && supabase start
cd ../..
cp frontend/.env.example frontend/.env.local   # fill from supabase status -o env
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

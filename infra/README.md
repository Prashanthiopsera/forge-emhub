# Infrastructure

Foundation infra for the Employee Onboarding Hub (WO-001 — REQ-018).

## What's here

| Folder | Purpose |
|---|---|
| `terraform/` | Supabase project IaC for dev / staging / prod |
| `supabase/` | Supabase CLI `config.toml` for local development |
| `env/` | Example env files (real ones are gitignored) |
| `scripts/` | `integration-test.sh` — local end-to-end smoke test |
| `tests/` | Vitest integration test against the Supabase REST endpoint |

## Provisioning the project

One Supabase project hosts all three environments: `main` branch = prod, plus persistent
`dev` and `staging` branches.

```bash
cd infra/terraform
export SUPABASE_ACCESS_TOKEN=$(vault read -field=token kv/supabase/cli)
export TF_VAR_organization_id=$(vault read -field=org_id kv/supabase/cli)
export TF_VAR_db_password=$(openssl rand -base64 32)
export TF_VAR_dev_branch_password=$(openssl rand -base64 32)
export TF_VAR_staging_branch_password=$(openssl rand -base64 32)

cp terraform.tfvars.example terraform.tfvars   # edit recipients, region as needed
terraform init -backend-config=backend.hcl
terraform apply
```

See [`terraform/README.md`](./terraform/README.md) for the full IaC story.

## Local dev

```bash
brew install supabase/tap/supabase     # one-time
cd infra/supabase
supabase start                          # spins up Postgres + Auth + Storage + Realtime
supabase status                         # prints API_URL / ANON_KEY / SERVICE_ROLE_KEY
```

Copy the keys into `infra/env/.env.dev` (gitignored) and source it from the app.

## CI/CD

Forge Shipping and GitHub Actions pipelines are defined in [`.forge/pipeline.yaml`](../.forge/pipeline.yaml) and [`.github/workflows/`](../.github/workflows/). See [docs/ci-cd/README.md](../docs/ci-cd/README.md) and [docs/ci-cd/ROLLBACK.md](../docs/ci-cd/ROLLBACK.md).

## Database schema

Core PostgreSQL schema and seed data live under [`supabase/`](./supabase/). See [`supabase/migrations/README.md`](./supabase/migrations/README.md).

```bash
cd infra/supabase && supabase db reset   # migrations + seed
npm run test:schema                    # static SQL checks
npm run test:schema:integration          # requires Supabase CLI
```

## CDN / WAF (Cloudflare)

Edge delivery for the SPA is managed in [`cloudflare/`](./cloudflare/). See [`cloudflare/README.md`](./cloudflare/README.md) for apply steps and synthetic verification.

## Running the integration test

```bash
npm install
npm run test:integration
```

The script boots local Supabase, exports the env vars from `supabase status`, runs
`infra/tests/supabase-health.test.mjs`, and tears the stack down.

## Secrets

| Secret | Stored in | Loaded into |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` (CLI / management API) | Secret vault | CI only |
| `TF_VAR_db_password` | Secret vault | CI + ops shell only |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret vault | Edge Functions runtime + CI smoke tests |
| `SUPABASE_ANON_KEY` | Secret vault | Frontend at build/deploy time |
| `SUPABASE_JWT_SECRET` | Secret vault | Edge Functions runtime |

Rules:

1. Never write a real secret to a file that isn't in `.gitignore`.
2. `gitleaks` runs in CI (`scan:gitleaks` step) — a leak fails the build.
3. Rotate the DB password and service role key any time a teammate with access leaves.
4. Prod secrets never touch a developer machine. CI is the only consumer.

## Cost guardrails

| Environment | Monthly budget | Alert threshold |
|---|---|---|
| dev | $150 | $120 |
| staging | $150 | $120 |
| prod | $500 | **$400** (WO-001 AC) |

Alerts are registered by `infra/terraform/budget.tf` via the Supabase Management API on every
`terraform apply`. Verify after each apply in the Supabase dashboard.

## Architecture references

- WO-001 (this work order) — Provision Supabase Project and IaC Baseline
- REQ-018 — Infrastructure foundation
- REQ-020 — Cost monitoring (<$500/month)
- Architecture mandate: PostgreSQL 16, Terraform 1.9+, Forge Shipping CI/CD

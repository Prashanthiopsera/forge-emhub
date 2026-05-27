# CI/CD — Employee Onboarding Hub

Forge Shipping is the primary delivery engine (WO-003). GitHub Actions mirrors the pipeline for PR validation and main-branch promotion.

## Pipeline layout

| Stage | Steps | When |
| --- | --- | --- |
| Validate | `scan:gitleaks`, `scan:semgrep`, `scan:sonarqube` (dependency/quality) | Every main push + PR |
| Test | `test:generic` — `npm run lint && npm run test` | Every main push + PR |
| Build | `build:node` — Vite production bundle in `frontend/dist` | After tests pass |
| Publish | `push:s3` — versioned artifact | Main only |
| Deploy dev | Auto, no approval | Main, after publish |
| Deploy staging | After dev succeeds | Main |
| Deploy prod | **Manual approval** in GitHub environment `production` | `workflow_dispatch` only |

Definitions:

- Forge: [`.forge/pipeline.yaml`](../../.forge/pipeline.yaml)
- GitHub PR CI: [`.github/workflows/emhub-ci.yml`](../../.github/workflows/emhub-ci.yml)
- GitHub deploy: [`.github/workflows/emhub-deploy.yml`](../../.github/workflows/emhub-deploy.yml)

## Triggers

- **Pull requests → `main`:** `emhub-ci.yml` (lint, unit tests, build, gitleaks, semgrep, `npm audit`)
- **Push → `main`:** `emhub-ci.yml` + `emhub-deploy.yml` (dev deploy; staging follows dev)
- **Production:** Run **EMHub Deploy** workflow manually and select `production` (approval gate)

## Required secrets / variables

Configure per GitHub environment (`development`, `staging`, `production`):

| Name | Type | Purpose |
| --- | --- | --- |
| `EMHUB_DEV_S3_BUCKET` | secret | Dev static hosting bucket |
| `EMHUB_STAGING_S3_BUCKET` | secret | Staging bucket |
| `EMHUB_PROD_S3_BUCKET` | secret | Production bucket |
| `EMHUB_*_URL` | variable | Environment URL for deployment links |
| `AWS_REGION` | variable | Default `us-east-1` |

Forge pipeline uses the same bucket variable names via connector configuration.

## PR time budget

The CI job sets `timeout-minutes: 10` and runs lint, test, and build in one job to stay under the WO-003 PR validation target.

## Rollback

See [ROLLBACK.md](./ROLLBACK.md).

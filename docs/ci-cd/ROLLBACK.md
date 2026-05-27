# Frontend rollback procedure (WO-003)

**Target:** restore the previous production SPA release within **15 minutes**.

## Prerequisites

- Access to the production static host (S3 + Cloudflare or equivalent from WO-004)
- GitHub Actions run history for `EMHub Deploy`
- Previous release artifact (S3 versioned prefix or GitHub Actions artifact)

## Option A — Repoint `current/` to previous S3 release (fastest)

1. List versioned releases: `aws s3 ls s3://$EMHUB_PROD_S3_BUCKET/releases/`
2. Identify the last known-good SHA prefix (e.g. `releases/a1b2c3d/`).
3. Sync previous bundle to `current/`:
   ```bash
   aws s3 sync "s3://${EMHUB_PROD_S3_BUCKET}/releases/${GOOD_SHA}/" \
     "s3://${EMHUB_PROD_S3_BUCKET}/current/" --delete
   ```
4. Invalidate CDN cache for `index.html` and `/assets/*` (Cloudflare: Purge Everything or tagged purge).
5. Verify: open production URL, hard-refresh, confirm build hash in network tab matches `${GOOD_SHA}`.

**Expected duration:** 5–10 minutes.

## Option B — Re-run deploy workflow from previous commit

1. In GitHub → **Actions** → **EMHub Deploy** → **Run workflow**.
2. Select branch `main` at commit `${GOOD_SHA}` (use “Run workflow” from that commit’s check suite if available).
3. Choose environment `production` and approve the environment gate.
4. Wait for `deploy-production` job to finish; verify health.

**Expected duration:** 8–15 minutes (includes build unless artifact is reused).

## Option C — Git revert + forward fix

Use when the bad release must be removed from `main`:

1. `git revert <bad-commit>` on `main` and push.
2. Let CI/CD deploy the reverted build through staging → production with approval.
3. Document incident in Forge work order audit trail.

**Expected duration:** 15+ minutes; prefer Option A for incident response.

## Post-rollback

- Record `rollback_sha`, time, and operator in the change log / incident ticket.
- Link the Forge work order or PR that introduced the regression.
- Run smoke tests: home page load, login route placeholder, dashboard route.

## Prevention

- Every main deploy uploads to `releases/${GIT_SHA_SHORT}/` before promoting `current/`.
- Production deploys always require manual approval (`production` environment).

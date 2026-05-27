#!/usr/bin/env bash
# Upload frontend/dist to object storage for static SPA hosting (WO-003).
# Requires: aws CLI + credentials, or EMHUB_DEPLOY_DRY_RUN=1 for CI smoke without cloud.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIST="${ROOT}/frontend/dist"
DEPLOY_ENV="${DEPLOY_ENV:-development}"

if [[ ! -d "$DIST" ]]; then
  echo "ERROR: $DIST not found — run npm run build first." >&2
  exit 1
fi

if [[ "${EMHUB_DEPLOY_DRY_RUN:-}" == "1" ]]; then
  echo "[dry-run] Would deploy $DIST to env=$DEPLOY_ENV bucket=${S3_BUCKET:-unset}"
  exit 0
fi

if [[ -z "${S3_BUCKET:-}" ]]; then
  echo "WARN: S3_BUCKET not set for $DEPLOY_ENV — skipping upload (configure GitHub environment secrets)." >&2
  exit 0
fi

PREFIX="${S3_PREFIX:-current/}"
REGION="${AWS_REGION:-us-east-1}"

echo "Deploying to s3://${S3_BUCKET}/${PREFIX} (${DEPLOY_ENV})"
aws s3 sync "$DIST" "s3://${S3_BUCKET}/${PREFIX}" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"
aws s3 cp "$DIST/index.html" "s3://${S3_BUCKET}/${PREFIX}index.html" \
  --region "$REGION" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"
echo "Deploy complete."

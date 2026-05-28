# Deployment rollback

**Symptoms:** Spike in errors after deploy; broken UI; failed smoke tests.

1. Identify last good commit on `main` / release tag.
2. Re-run GitHub Actions deploy workflow from previous artifact, or promote prior Cloudflare deployment.
3. Target: rollback within **15 minutes** of detection.
4. Verify `/` and `/login` load; run `npm run test` on the release tag.
5. Post-incident: document root cause in Forge work order comments.

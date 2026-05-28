# Database Backup and Recovery (WO-039)

## Configuration

- **PITR:** Enable in Supabase project settings (Dashboard → Database → Backups).
- **Retention:** Minimum 7 days for point-in-time recovery.
- **Monitoring:** Configure Supabase project alerts for failed backups.

## Recovery runbook

1. Open Supabase Dashboard → Database → Backups → Point in time.
2. Select recovery timestamp (within retention window).
3. Restore to a **new** branch or staging project first; validate data.
4. Update `VITE_SUPABASE_URL` / keys in the target environment.
5. Run `supabase db reset` locally only for dev — never against production without approval.

## Targets

| Metric | Target |
|--------|--------|
| RPO | &lt; 15 minutes |
| RTO | &lt; 2 hours |

## Dev validation

Run `./infra/scripts/schema-migrate-test.sh` after restore drills on non-production projects.

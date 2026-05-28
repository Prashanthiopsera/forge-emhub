# Database migrations (WO-005)

Versioned SQL migrations for Supabase PostgreSQL 16.

## Apply locally

```bash
cd infra/supabase
supabase start          # if not running
supabase db reset       # applies migrations + seed.sql
```

## Files

| Migration | Description |
| --- | --- |
| `20260528000000_core_schema.sql` | Core tables, indexes, FTS, audit triggers |

## Seed data

`../seed.sql` — 5 departments, 20 users (4 roles), 3 onboarding templates, FAQ articles, org chart nodes.

Default dev password for seeded users: `EmhubDev123!` (local only).

## Review

SQL changes require code review from @sreekanth bharatham before production apply (workspace policy).

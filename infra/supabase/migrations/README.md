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
| `20260528000001_row_level_security.sql` | RLS policies for four-role model (WO-006) |
| `20260528000002_auth_jwt_role_claim.sql` | JWT `role` claim hook + signup profile trigger (WO-008) |

## Seed data

`../seed.sql` — 5 departments, 20 users (4 roles), 3 onboarding templates, FAQ articles, org chart nodes.

Default dev password for seeded users: `EmhubDev123!` (local only).

## Review

SQL changes require code review from @sreekanth bharatham before production apply (workspace policy).

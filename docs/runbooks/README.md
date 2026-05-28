# Operational Runbooks (WO-040)

| Runbook | When to use |
|---------|-------------|
| [deployment-rollback.md](./deployment-rollback.md) | Bad frontend release, 5xx from static host |
| [database-recovery.md](./database-recovery.md) | Data loss, corrupt migration |
| [supabase-outage.md](./supabase-outage.md) | Auth/API unavailable |
| [cdn-waf.md](./cdn-waf.md) | Cloudflare blocking legitimate traffic |
| [llm-failure.md](./llm-failure.md) | Chatbot LLM errors or cost spike |
| [high-error-rate.md](./high-error-rate.md) | APM alerts, elevated client errors |

Each runbook includes: symptoms, diagnosis, resolution, escalation, post-incident checklist.

# RLS access matrix (WO-006)

| Table | Employee | Manager | HR Admin | IT Ops |
| --- | --- | --- | --- | --- |
| departments | SELECT | SELECT | ALL | SELECT |
| profiles | SELECT/UPDATE own | SELECT reports | ALL | SELECT |
| onboarding_templates | SELECT active | SELECT active | ALL | — |
| template_tasks | SELECT | SELECT | ALL | — |
| task_progress | SELECT/UPDATE own | SELECT reports | ALL | — |
| video_progress | ALL own | SELECT reports | ALL | — |
| quiz_attempts | INSERT/SELECT own | SELECT reports | ALL | — |
| faq_* | SELECT published | SELECT published | ALL | — |
| org_chart_nodes | SELECT | SELECT | ALL | — |
| chat_* | ALL own session | — | SELECT all | — |
| notifications | SELECT own | — | ALL | SELECT/UPDATE provisioning |
| audit_log | — | — | SELECT | — |

Unauthorized rows return **empty sets** (Supabase/PostgREST convention).

Policy changes are captured by `audit_row_change()` triggers on content tables.

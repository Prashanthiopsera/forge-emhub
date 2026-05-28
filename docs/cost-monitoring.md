# Cost Monitoring and Budget (WO-041)

**Monthly ceiling:** $500 (BRD).

## Service breakdown

| Service | Notes |
|---------|--------|
| Supabase | DB, Auth, Storage, Edge Functions |
| Cloudflare | CDN + WAF |
| LLM API | Chatbot fallback — rate limited in app (20 calls/user/hour) |
| Email | `send-notification` Edge Function |
| Video | Vimeo/Wistia embeds (no self-host) |

## Alerts

- **80% ($400):** Review LLM and Supabase usage dashboards.
- **100% ($500):** Disable LLM fallback in chatbot (`respond.ts`); escalate to engineering lead.

## LLM cost controls

- Client rate limit: 20 responses/user/hour (localStorage + server logging).
- When monthly cap reached: rule-based FAQ only, no LLM stub calls.

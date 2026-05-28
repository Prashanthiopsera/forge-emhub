# Cloudflare CDN & WAF (WO-004)

Terraform provisions edge delivery for the React SPA: TLS 1.3, security headers, WAF, cache rules, and per-IP rate limiting.

## Prerequisites

- Cloudflare account with the target zone (or permission to create one)
- `CLOUDFLARE_API_TOKEN` with Zone:Edit, DNS:Edit, WAF:Edit
- Origin hostname from S3 static website or load balancer (see `infra/scripts/deploy-static.sh`)
- Terraform `>= 1.9.0`

## Apply

```bash
export CLOUDFLARE_API_TOKEN=$(vault read -field=token kv/cloudflare/api)
export TF_VAR_cloudflare_account_id="your-account-id"

cd infra/cloudflare/terraform
cp terraform.tfvars.example terraform.tfvars   # edit zone, hostname, origin

terraform init -backend-config=backend.hcl
terraform plan -out=tfplan
terraform apply tfplan
```

Delegate DNS at your registrar to the `nameservers` output.

## What gets configured

| Control | Implementation |
| --- | --- |
| TLS 1.3 | `cloudflare_zone_settings_override` (`min_tls_version = 1.3`) |
| Security headers | Transform rules: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| WAF | Managed ruleset + custom blocks for SQLi, XSS, path traversal |
| Static asset cache | Cache rules for `/assets/` and static extensions (1 year edge TTL) |
| HTML shell | Bypass cache for `/`, `/index.html`, `*.html` |
| Rate limit | 1000 requests / 60s / IP (configurable) |

## Verification

```bash
# Header and TLS check (set after deploy)
export EMHUB_SPA_URL=https://onboarding.example.com
./infra/cloudflare/scripts/synthetic-check.sh
```

Target: SPA shell TTFB supports **&lt; 2s P95 on 4G** once origin + CDN are live (measure with RUM/synthetic in WO-033).

## Environments

Use separate `terraform.tfvars` / workspaces per environment (`dev`, `staging`, `production`) with distinct `spa_hostname` and `origin_hostname` values.

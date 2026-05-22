# Supabase IaC — Terraform

Provisions the Supabase **project** (with `main` branch = production) plus **dev** and **staging**
branches per WO-001. One project, three environments — matching the architecture mandate
"single Supabase project using separate dev, staging, and prod environments".

## Prerequisites

- Terraform `>= 1.9.0`
- Supabase organization with billing enabled
- Service access token: `SUPABASE_ACCESS_TOKEN` (used by both the `supabase` provider and the
  cost-alert `local-exec` provisioner)
- Generate strong passwords for **all three** branches and store them in the secret vault.
  Export at apply time:
  - `TF_VAR_db_password` (prod / main branch)
  - `TF_VAR_dev_branch_password`
  - `TF_VAR_staging_branch_password`
- Org ID exported as `TF_VAR_organization_id`.

## Layout

```
terraform/
├── versions.tf                 # Required providers + S3 backend stub
├── variables.tf                # Input variables with validation
├── main.tf                     # supabase_project + supabase_branch (dev, staging)
├── budget.tf                   # $400 org-level cost alert (REQ-020 / WO-001 AC #5)
├── outputs.tf                  # URLs per environment — secrets stay out of state
└── terraform.tfvars.example    # Non-secret values; copy to terraform.tfvars
```

## Workflow

```bash
# 1. Export secrets (these never appear in committed files)
export SUPABASE_ACCESS_TOKEN=$(vault read -field=token kv/supabase/cli)
export TF_VAR_organization_id=$(vault read -field=org_id kv/supabase/cli)
export TF_VAR_db_password=$(openssl rand -base64 32)
export TF_VAR_dev_branch_password=$(openssl rand -base64 32)
export TF_VAR_staging_branch_password=$(openssl rand -base64 32)

# Store the generated passwords back into the vault before continuing —
# they are unrecoverable from Terraform state.

# 2. Copy and tweak the non-secret tfvars
cp terraform.tfvars.example terraform.tfvars
# (edit project_name, region, compute_sizes, cost_alert_emails as needed)

# 3. Init with the remote backend (configured per workspace via -backend-config)
terraform init -backend-config=backend.hcl

# 4. Plan + apply
terraform plan  -out=tfplan
terraform apply tfplan
```

## What gets created

| Resource | Maps to |
|---|---|
| `supabase_project.main` | The single Supabase project. Its main branch is production. |
| `supabase_settings.auth` | Site URL, JWT expiry, signup-disabled, captcha, secure email change |
| `supabase_settings.features` | Storage file-size limit, PostgREST max_rows |
| `supabase_branch.dev` | Persistent dev branch — own DB + own anon/service keys |
| `supabase_branch.staging` | Persistent staging branch — own DB + own anon/service keys |
| `null_resource.cost_alert` | Org-level billing alert at `$cost_alert_threshold_usd` (default $400) |

## Cost alert

`budget.tf` calls the Supabase Management API
(`POST /v1/organizations/<org>/billing/alerts`) on every apply to register an
organization-level budget alert at `var.cost_alert_threshold_usd` (defaults to **$400**)
with `var.monthly_budget_usd` (defaults to **$500**) as the ceiling.

Until Supabase ships a typed Terraform resource for billing alerts, this is the supported
path. Verify after each apply in the Supabase dashboard under **Organization → Billing → Alerts**.

## Drift detection

Run `terraform plan` in CI nightly. Any non-empty plan against the live stack is an alert
event — manual dashboard changes are not allowed (architecture concern #15).

## Recreating from scratch

```bash
terraform init -backend-config=backend.hcl
terraform apply
```

Same tfvars + secrets yield an identical project + branches. Branch URLs and project ref
change; rotate the new anon/service keys into the secret vault via:

```bash
supabase projects api-keys --project-ref <ref>
```

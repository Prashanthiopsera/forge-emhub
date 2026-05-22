# Cost monitoring
#
# Supabase does not (as of provider v1.x) expose a typed budget-alert resource via Terraform.
# We register an organization-level billing alert via the Supabase Management API in a
# null_resource so the alert is declared in IaC and re-applied on every `terraform apply`.
#
# Single organization-level alert covers all branches (dev + staging + prod) since they share
# the same billing entity. This satisfies WO-001 AC #5: "Monthly cost alert is configured at
# $400 threshold to protect the $500/month budget ceiling".
#
# Required env vars at apply time:
#   SUPABASE_ACCESS_TOKEN — personal/service access token with billing scope
#
# When the Supabase provider ships a typed `supabase_budget_alert` resource, swap this
# null_resource for the typed resource and delete the local-exec.

resource "null_resource" "cost_alert" {
  triggers = {
    organization_id = var.organization_id
    project_id      = supabase_project.main.id
    threshold       = var.cost_alert_threshold_usd
    budget          = var.monthly_budget_usd
    recipients      = join(",", var.cost_alert_emails)
  }

  provisioner "local-exec" {
    command = <<-EOT
      set -euo pipefail
      : "$${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN must be set for cost-alert provisioning}"
      curl -sS -X POST \
        "https://api.supabase.com/v1/organizations/${var.organization_id}/billing/alerts" \
        -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "name": "emhub-org-cost-alert",
          "threshold_usd": ${var.cost_alert_threshold_usd},
          "budget_ceiling_usd": ${var.monthly_budget_usd},
          "scope": "organization",
          "recipients": ${jsonencode(var.cost_alert_emails)}
        }' > /dev/null
    EOT
  }
}

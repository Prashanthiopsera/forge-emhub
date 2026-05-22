# Per-environment REST and Auth endpoints.
# Each branch gets its own subdomain on Supabase's managed infrastructure.

output "project_id" {
  description = "Supabase main project reference ID (production branch lives here)."
  value       = supabase_project.main.id
}

output "prod_rest_url" {
  description = "Production REST endpoint."
  value       = "https://${supabase_project.main.id}.supabase.co/rest/v1"
}

output "prod_auth_url" {
  description = "Production GoTrue auth endpoint."
  value       = "https://${supabase_project.main.id}.supabase.co/auth/v1"
}

output "prod_realtime_url" {
  description = "Production Realtime WebSocket endpoint."
  value       = "wss://${supabase_project.main.id}.supabase.co/realtime/v1"
}

output "dev_branch_id" {
  description = "Dev branch reference ID."
  value       = supabase_branch.dev.id
}

output "dev_rest_url" {
  description = "Dev REST endpoint."
  value       = "https://${supabase_branch.dev.id}.supabase.co/rest/v1"
}

output "staging_branch_id" {
  description = "Staging branch reference ID."
  value       = supabase_branch.staging.id
}

output "staging_rest_url" {
  description = "Staging REST endpoint."
  value       = "https://${supabase_branch.staging.id}.supabase.co/rest/v1"
}

# Secrets are NEVER emitted as Terraform outputs. CI fetches them at deploy time:
#   supabase projects api-keys --project-ref <id>
# and rotates them into the secret vault. See infra/README.md.
output "secrets_location_hint" {
  description = "Where to retrieve secrets for each branch. Never the Terraform state file."
  value = {
    prod    = "supabase projects api-keys --project-ref ${supabase_project.main.id}"
    dev     = "supabase projects api-keys --project-ref ${supabase_branch.dev.id}"
    staging = "supabase projects api-keys --project-ref ${supabase_branch.staging.id}"
  }
}

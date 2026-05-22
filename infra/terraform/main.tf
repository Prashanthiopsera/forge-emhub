locals {
  project_name = var.project_name

  # The "main" branch of a Supabase project IS the production environment.
  # Dev and staging are persistent supabase_branch resources off of it.
  # All three share the same project entity, organization, and billing —
  # matching the architecture mandate: "single Supabase project using
  # separate dev, staging, and prod environments".
}

resource "supabase_project" "main" {
  organization_id   = var.organization_id
  name              = local.project_name
  region            = var.region
  database_password = var.db_password

  # Architecture mandate: PostgreSQL 16 with GIN full-text indexes available
  # on FAQ and org-chart tables.
  postgres_engine = "supabase-postgres-${var.postgres_version}"

  # Compute is sized for prod here; dev / staging branches override below.
  instance_size = var.compute_sizes["prod"]

  lifecycle {
    # Project deletion must be intentional — never let `terraform apply`
    # drop the production project on a refactor.
    prevent_destroy = true
  }
}

# Auth (GoTrue) — settings are project-wide and apply to all branches.
# PKCE flow is enforced in REQ-007 (WO-008); we configure baseline auth here.
resource "supabase_settings" "auth" {
  project_ref = supabase_project.main.id

  auth = jsonencode({
    site_url                           = "https://emhub.example.com"
    jwt_exp                            = 3600
    enable_signup                      = false # HR provisions accounts; no public sign-up
    external_email_enabled             = true
    mailer_secure_email_change_enabled = true
    security_captcha_enabled           = true
  })
}

# Realtime, Storage, and Edge Functions are enabled by default on the project.
# Storage file-size limit is documented here for visibility.
resource "supabase_settings" "features" {
  project_ref = supabase_project.main.id

  api = jsonencode({
    db_schema            = "public"
    db_extra_search_path = ""
    max_rows             = 1000
  })

  storage = var.enable_storage ? jsonencode({
    # 50 MB for non-video assets — training videos use external CDN per REQ-002.
    file_size_limit = 52428800
  }) : null
}

# -------------------------------------------------------------------------
# Persistent branches for dev and staging.
# These are full Supabase branches (separate DB, separate API keys, separate
# URL) rooted off the main/prod project. The architecture's "single project
# with three environments" model maps to: main branch = prod, plus two
# named branches (dev, staging).
# -------------------------------------------------------------------------

resource "supabase_branch" "dev" {
  parent_project_ref = supabase_project.main.id
  branch_name        = "dev"
  database_password  = var.dev_branch_password
  region             = var.region
  instance_size      = var.compute_sizes["dev"]
}

resource "supabase_branch" "staging" {
  parent_project_ref = supabase_project.main.id
  branch_name        = "staging"
  database_password  = var.staging_branch_password
  region             = var.region
  instance_size      = var.compute_sizes["staging"]
}

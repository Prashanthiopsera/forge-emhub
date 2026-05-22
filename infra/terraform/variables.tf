variable "organization_id" {
  description = "Supabase organization ID. Sourced from TF_VAR_organization_id (env vault) to keep it out of state."
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Supabase project name. The project hosts dev/staging/prod as a main branch + two named branches."
  type        = string
  default     = "emhub"
}

variable "region" {
  description = "Supabase project region. See https://supabase.com/docs/guides/platform/regions for valid values."
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password for the production (main) branch's postgres role. Sourced from TF_VAR_db_password. Never commit."
  type        = string
  sensitive   = true
}

variable "dev_branch_password" {
  description = "Database password for the dev branch's postgres role. Sourced from TF_VAR_dev_branch_password. Never commit."
  type        = string
  sensitive   = true
}

variable "staging_branch_password" {
  description = "Database password for the staging branch's postgres role. Sourced from TF_VAR_staging_branch_password. Never commit."
  type        = string
  sensitive   = true
}

variable "postgres_version" {
  description = "PostgreSQL major version. Architecture mandates 16."
  type        = string
  default     = "16"
}

variable "compute_sizes" {
  description = "Compute tier per environment. dev=small, staging=medium, prod=large per architecture sizing guidance."
  type        = map(string)
  default = {
    dev     = "small"
    staging = "medium"
    prod    = "large"
  }
}

variable "monthly_budget_usd" {
  description = "Monthly budget ceiling for the organization. REQ-020 mandates <$500/month total spend."
  type        = number
  default     = 500
}

variable "cost_alert_threshold_usd" {
  description = "Hard alert threshold in USD. WO-001 AC mandates $400 alert against the $500 ceiling."
  type        = number
  default     = 400
}

variable "cost_alert_emails" {
  description = "Email recipients for cost alert notifications."
  type        = list(string)
}

variable "enable_storage" {
  description = "Enable Supabase Storage on the project (all branches inherit)."
  type        = bool
  default     = true
}

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }

  # Remote state is environment-specific and configured via -backend-config
  # at `terraform init` time. Example: `terraform init -backend-config=environments/dev.backend.hcl`
  backend "s3" {}
}

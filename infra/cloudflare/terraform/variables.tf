variable "cloudflare_account_id" {
  description = "Cloudflare account ID. Set via TF_VAR_cloudflare_account_id."
  type        = string
}

variable "zone_name" {
  description = "DNS zone apex (e.g. example.com). The SPA is served on spa_hostname within this zone."
  type        = string
}

variable "spa_hostname" {
  description = "Fully qualified hostname for the React SPA (e.g. onboarding.example.com)."
  type        = string
}

variable "origin_hostname" {
  description = "Origin hostname (S3 static website or load balancer) for the SPA assets."
  type        = string
}

variable "environment" {
  description = "Deployment environment label (dev, staging, production)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "environment must be dev, staging, or production."
  }
}

variable "rate_limit_requests_per_minute" {
  description = "Maximum requests per IP per 60-second window (WO-004 AC)."
  type        = number
  default     = 1000
}

variable "zone_plan" {
  description = "Cloudflare zone plan. Pro or Business may be required for advanced WAF features."
  type        = string
  default     = "pro"
}

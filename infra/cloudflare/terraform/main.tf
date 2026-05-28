provider "cloudflare" {
  # CLOUDFLARE_API_TOKEN must be set in the environment (never committed).
}

resource "cloudflare_zone" "main" {
  account_id = var.cloudflare_account_id
  zone       = var.zone_name
  plan       = var.zone_plan
}

locals {
  zone_id = cloudflare_zone.main.id
  spa_record_name = (
    var.spa_hostname == var.zone_name
    ? "@"
    : trimsuffix(var.spa_hostname, ".${var.zone_name}")
  )
}

resource "cloudflare_record" "spa" {
  zone_id = local.zone_id
  name    = local.spa_record_name
  content = var.origin_hostname
  type    = "CNAME"
  proxied = true
  comment = "Employee Onboarding Hub SPA (${var.environment})"
}

resource "cloudflare_zone_settings_override" "tls_and_https" {
  zone_id = local.zone_id

  settings {
    always_use_https           = "on"
    automatic_https_rewrites = "on"
    min_tls_version            = "1.3"
    tls_1_3                    = "on"
    ssl                        = "full"
    browser_check              = "on"
    security_level             = "medium"
  }
}

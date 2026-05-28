resource "cloudflare_ruleset" "rate_limit" {
  zone_id = local.zone_id
  name    = "rate_limit_${var.environment}"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules {
    enabled     = true
    description = "Limit to ${var.rate_limit_requests_per_minute} requests per minute per IP"
    expression  = "true"
    action      = "block"

    action_parameters {
      ratelimit {
        characteristics     = ["ip.src"]
        period                = 60
        requests_per_period   = var.rate_limit_requests_per_minute
        mitigation_timeout    = 60
      }
    }
  }
}

resource "cloudflare_ruleset" "security_headers" {
  zone_id = local.zone_id
  name    = "security_headers_${var.environment}"
  kind    = "zone"
  phase   = "http_response_headers_transform"

  rules {
    enabled     = true
    description = "Set required security headers (WO-004)"
    expression  = "true"
    action      = "rewrite"

    action_parameters {
      headers {
        name      = "Strict-Transport-Security"
        operation = "set"
        value     = "max-age=31536000; includeSubDomains; preload"
      }
      headers {
        name      = "X-Content-Type-Options"
        operation = "set"
        value     = "nosniff"
      }
      headers {
        name      = "X-Frame-Options"
        operation = "set"
        value     = "DENY"
      }
      headers {
        name      = "Referrer-Policy"
        operation = "set"
        value     = "strict-origin-when-cross-origin"
      }
      headers {
        name      = "Content-Security-Policy"
        operation = "set"
        value     = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
      }
    }
  }
}

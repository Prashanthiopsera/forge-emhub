# Managed WAF + custom rules for OWASP Top 10 patterns (WO-004)

resource "cloudflare_ruleset" "managed_waf" {
  zone_id = local.zone_id
  name    = "managed_waf_${var.environment}"
  kind    = "zone"
  phase   = "http_request_firewall_managed"

  rules {
    enabled     = true
    action      = "execute"
    expression  = "true"
    description = "Cloudflare managed ruleset (OWASP-aligned: SQLi, XSS, RCE, etc.)"

    action_parameters {
      # Cloudflare Managed Ruleset — https://developers.cloudflare.com/waf/managed-rules/
      id = "efb7b8c949ac4650a79736d482673e98cfb0bfc91af345091e24fcb5564ae3"
    }
  }
}

resource "cloudflare_ruleset" "custom_waf" {
  zone_id = local.zone_id
  name    = "custom_waf_${var.environment}"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    enabled     = true
    action      = "block"
    description = "Block SQL injection patterns in URI and query"
    expression  = <<-EOT
      (http.request.uri.query contains "'") or
      (http.request.uri.query contains "--") or
      (http.request.uri.query contains "union select") or
      (http.request.uri.path contains "'")
    EOT
  }

  rules {
    enabled     = true
    action      = "block"
    description = "Block path traversal"
    expression  = "(http.request.uri.path contains \"../\") or (http.request.uri.path contains \"%2e%2e\")"
  }

  rules {
    enabled     = true
    action      = "block"
    description = "Block reflected XSS payloads in URI"
    expression  = <<-EOT
      (http.request.uri.query contains "<script") or
      (http.request.uri.query contains "javascript:") or
      (http.request.uri.path contains "<script")
    EOT
  }
}

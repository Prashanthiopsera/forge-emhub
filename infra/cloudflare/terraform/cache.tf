# Edge caching: long TTL for hashed assets, no cache for HTML shell (SPA routing)

resource "cloudflare_ruleset" "cache_rules" {
  zone_id = local.zone_id
  name    = "cache_rules_${var.environment}"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules {
    enabled     = true
    description = "Cache static assets at the edge (Vite /assets/ and file extensions)"
    expression  = <<-EOT
      (http.request.uri.path contains "/assets/") or
      (http.request.uri.path.extension in {"js" "css" "woff" "woff2" "png" "jpg" "jpeg" "gif" "svg" "ico" "webp"})
    EOT
    action = "set_cache_settings"

    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 31536000
      }
      browser_ttl {
        mode    = "override_origin"
        default = 31536000
      }
    }
  }

  rules {
    enabled     = true
    description = "Do not cache HTML shell — supports client-side routing"
    expression  = <<-EOT
      (http.request.uri.path eq "/") or
      (http.request.uri.path eq "/index.html") or
      (http.request.uri.path.extension eq "html")
    EOT
    action = "set_cache_settings"

    action_parameters {
      cache = false
      edge_ttl {
        mode = "bypass_by_default"
      }
      browser_ttl {
        mode = "bypass_by_default"
      }
    }
  }
}

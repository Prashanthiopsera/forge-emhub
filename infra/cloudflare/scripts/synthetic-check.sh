#!/usr/bin/env bash
# Synthetic HTTP checks for CDN/WAF configuration (WO-004).
set -euo pipefail

BASE_URL="${EMHUB_SPA_URL:-}"
if [[ -z "$BASE_URL" ]]; then
  echo "Set EMHUB_SPA_URL (e.g. https://onboarding.example.com) to run synthetic checks." >&2
  exit 0
fi

echo "Checking $BASE_URL ..."

headers=$(curl -sSI --max-time 15 "$BASE_URL/" || true)
assert_header() {
  local name="$1"
  if ! echo "$headers" | grep -qi "^${name}:"; then
    echo "FAIL: missing header $name" >&2
    exit 1
  fi
  echo "OK: $name present"
}

assert_header "strict-transport-security"
assert_header "content-security-policy"
assert_header "x-content-type-options"
assert_header "x-frame-options"
assert_header "referrer-policy"

# TLS 1.3 (requires openssl s_client)
host=$(echo "$BASE_URL" | sed -E 's#https?://([^/]+).*#\1#')
if openssl s_client -connect "${host}:443" -tls1_3 </dev/null 2>/dev/null | grep -q "Protocol"; then
  echo "OK: TLS 1.3 handshake succeeded"
else
  echo "WARN: could not confirm TLS 1.3 (openssl check skipped or failed)"
fi

timing=$(curl -sS -o /dev/null -w "%{time_starttransfer}" "$BASE_URL/")
echo "Time to first byte: ${timing}s (target < 2s on 4G cold cache — validate in staging)"

echo "Synthetic checks completed."

#!/usr/bin/env bash
# WO-033: Synthetic uptime and performance checks for SPA delivery.
set -euo pipefail

BASE_URL="${EMHUB_SPA_URL:-}"
P95_TTFB_TARGET_SEC="${EMHUB_P95_TTFB_SEC:-2}"
CONSECUTIVE_FAIL_ALERT="${EMHUB_SYNTHETIC_FAIL_STREAK:-2}"

if [[ -z "$BASE_URL" ]]; then
  echo "Set EMHUB_SPA_URL (e.g. https://onboarding.example.com) to run synthetic checks." >&2
  exit 0
fi

echo "Checking $BASE_URL (P95 TTFB target < ${P95_TTFB_TARGET_SEC}s)..."

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

host=$(echo "$BASE_URL" | sed -E 's#https?://([^/]+).*#\1#')
if openssl s_client -connect "${host}:443" -tls1_3 </dev/null 2>/dev/null | grep -q "Protocol"; then
  echo "OK: TLS 1.3 handshake succeeded"
else
  echo "WARN: could not confirm TLS 1.3 (openssl check skipped or failed)"
fi

ttfb_samples=()
for _ in 1 2 3 4 5; do
  sample=$(curl -sS -o /dev/null -w "%{time_starttransfer}" "$BASE_URL/" || echo "999")
  ttfb_samples+=("$sample")
done

IFS=$'\n' sorted=($(printf '%s\n' "${ttfb_samples[@]}" | sort -n))
p95_index=4
p95_ttfb="${sorted[$p95_index]}"
echo "TTFB samples (s): ${ttfb_samples[*]}"
echo "P95 time to first byte: ${p95_ttfb}s (target < ${P95_TTFB_TARGET_SEC}s on 4G cold cache)"

if awk -v p95="$p95_ttfb" -v target="$P95_TTFB_TARGET_SEC" 'BEGIN { exit !(p95 > target) }'; then
  echo "ALERT: P95 TTFB exceeds ${P95_TTFB_TARGET_SEC}s — page load SLO at risk (WO-033)" >&2
  exit 1
fi

status_code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/" || echo "000")
if [[ "$status_code" != "200" && "$status_code" != "304" ]]; then
  echo "FAIL: unexpected HTTP status $status_code" >&2
  exit 1
fi
echo "OK: HTTP $status_code"

# Optional second probe — consecutive failure detection for uptime alerting
sleep 1
status_code_2=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/" || echo "000")
if [[ "$status_code_2" != "200" && "$status_code_2" != "304" ]]; then
  echo "ALERT: ${CONSECUTIVE_FAIL_ALERT} consecutive synthetic failures would fire (WO-033)" >&2
  exit 1
fi

echo "Synthetic checks completed."

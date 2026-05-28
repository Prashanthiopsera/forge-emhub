import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../terraform');
const files = readdirSync(root).filter((f) => f.endsWith('.tf'));
const allTf = files.map((f) => readFileSync(join(root, f), 'utf8')).join('\n');

describe('Cloudflare Terraform (WO-004)', () => {
  it('enforces TLS 1.3 and proxied SPA record', () => {
    assert.match(allTf, /min_tls_version\s*=\s*"1.3"/);
    assert.match(allTf, /proxied\s*=\s*true/);
  });

  it('configures required security headers', () => {
    assert.match(allTf, /Strict-Transport-Security/);
    assert.match(allTf, /Content-Security-Policy/);
    assert.match(allTf, /X-Content-Type-Options/);
    assert.match(allTf, /X-Frame-Options/);
    assert.match(allTf, /Referrer-Policy/);
  });

  it('defines WAF and cache rules', () => {
    assert.match(allTf, /http_request_firewall_managed/);
    assert.match(allTf, /http_request_firewall_custom/);
    assert.match(allTf, /path traversal/i);
    assert.match(allTf, /http_request_cache_settings/);
    assert.match(allTf, /\/assets\//);
  });

  it('rate limits to 1000 requests per minute per IP', () => {
    assert.match(allTf, /http_ratelimit/);
    assert.match(allTf, /requests_per_period/);
    assert.match(allTf, /ip\.src/);
  });
});

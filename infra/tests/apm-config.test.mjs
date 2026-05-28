import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const monitoring = readFileSync(join(root, '../frontend/src/lib/monitoring.ts'), 'utf8');
const errorBoundary = readFileSync(
  join(root, '../frontend/src/shared/components/ErrorBoundary.tsx'),
  'utf8',
);
const main = readFileSync(join(root, '../frontend/src/main.tsx'), 'utf8');
const synthetic = readFileSync(join(root, 'scripts/synthetic-check.sh'), 'utf8');

describe('APM and error tracking (WO-033)', () => {
  it('includes client-side monitoring module', () => {
    assert.match(monitoring, /capturePagePerformance/);
    assert.match(monitoring, /reportError/);
    assert.match(monitoring, /largestContentfulPaintMs/);
    assert.match(monitoring, /P95_LOAD_THRESHOLD_MS/);
  });

  it('wires ErrorBoundary to reportError', () => {
    assert.match(errorBoundary, /reportError/);
  });

  it('initializes monitoring on app boot', () => {
    assert.match(main, /initMonitoring/);
  });

  it('enhances synthetic check with P95 TTFB gate', () => {
    assert.ok(existsSync(join(root, 'scripts/synthetic-check.sh')));
    assert.match(synthetic, /P95/);
    assert.match(synthetic, /EMHUB_P95_TTFB_SEC/);
    assert.match(synthetic, /CONSECUTIVE_FAIL/);
  });
});

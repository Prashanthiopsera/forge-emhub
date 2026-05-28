import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(
  join(root, '../frontend/src/app/routes.tsx'),
  'utf8',
);

describe('Analytics wiring (WO-027)', () => {
  it('wires /analytics to AnalyticsPage', () => {
    assert.match(routes, /path="\/analytics"\s+element=\{<AnalyticsPage\s*\/>\}/);
  });

  it('includes analytics feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/analytics');
    for (const file of [
      'AnalyticsPage.tsx',
      'BarChart.tsx',
      'useAnalytics.ts',
      'analytics.fixtures.ts',
      'analytics.logic.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

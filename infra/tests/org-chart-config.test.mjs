import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const routes = readFileSync(join(root, '../frontend/src/app/routes.tsx'), 'utf8');

describe('Org chart (WO-023)', () => {
  it('seeds org chart nodes with departments and manager links', () => {
    assert.match(seed, /INSERT INTO public\.org_chart_nodes/);
    assert.match(seed, /manager_node_id/);
    assert.match(seed, /INSERT INTO public\.departments/);
  });

  it('wires /org-chart to OrgChartPage', () => {
    assert.match(routes, /path="\/org-chart"\s+element=\{<OrgChartPage\s*\/>\}/);
  });

  it('includes org chart feature sources', () => {
    const dir = join(root, '../frontend/src/features/org-chart');
    for (const file of [
      'OrgChartPage.tsx',
      'org-chart.logic.ts',
      'useOrgChart.ts',
      'org-chart.logic.test.ts',
    ]) {
      assert.ok(existsSync(join(dir, file)), `missing ${file}`);
    }
  });
});

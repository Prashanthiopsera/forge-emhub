import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const routes = readFileSync(
  join(root, '../frontend/src/app/routes.tsx'),
  'utf8',
);

const alexId = 'a1000000-0000-4000-8000-000000000001';

describe('Checklist seed and wiring (WO-012)', () => {
  it('seeds tasks across Day 1, Week 1, and Month 1 for alex.newhire', () => {
    assert.match(seed, /Month 1/);
    assert.match(seed, /c1000000-0000-4000-8000-00000000005/);
    assert.match(seed, /b3000000-0000-4000-8000-00000000005/);
    assert.match(seed, new RegExp(alexId));
    assert.match(seed, /CURRENT_DATE - 3/);
  });

  it('wires /checklist to ChecklistPage', () => {
    assert.match(routes, /path="\/checklist"\s+element=\{<ChecklistPage\s*\/>\}/);
  });

  it('includes checklist feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/checklist');
    for (const file of [
      'ChecklistPage.tsx',
      'TaskItem.tsx',
      'ProgressBar.tsx',
      'useChecklist.ts',
      'checklist.fixtures.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

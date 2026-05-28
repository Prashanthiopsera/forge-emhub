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

const alexId = 'u1000000-0000-4000-8000-000000000001';

describe('Dashboard seed and wiring (WO-011)', () => {
  it('seeds onboarding plan and task progress for alex.newhire', () => {
    assert.match(seed, /INSERT INTO public\.onboarding_plans/);
    assert.match(seed, /INSERT INTO public\.task_progress/);
    assert.match(seed, new RegExp(alexId));
    assert.match(seed, /t1000000-0000-4000-8000-000000000001/);
    assert.match(seed, /tt100000-0000-4000-8000-00000000001/);
  });

  it('wires /dashboard to DashboardPage', () => {
    assert.match(routes, /path="\/dashboard"\s+element=\{<DashboardPage\s*\/>\}/);
  });

  it('includes dashboard feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/dashboard');
    for (const file of [
      'DashboardPage.tsx',
      'useDashboardData.ts',
      'dashboard.fixtures.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

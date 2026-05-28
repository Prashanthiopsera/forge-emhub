import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(join(root, '../frontend/src/app/routes.tsx'), 'utf8');
const edgeFn = readFileSync(join(root, 'supabase/functions/new-hire-onboard/index.ts'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000008_onboarding_plans_hr_write.sql'),
  'utf8',
);

describe('New hire creation (WO-032)', () => {
  it('wires /admin/new-hire to NewHirePage', () => {
    assert.match(routes, /path="\/admin\/new-hire"\s+element=\{<NewHirePage\s*\/>\}/);
  });

  it('includes new-hire-onboard edge function stub', () => {
    assert.ok(existsSync(join(root, 'supabase/functions/new-hire-onboard/index.ts')));
    assert.match(edgeFn, /auth\.admin\.createUser/);
    assert.match(edgeFn, /task_progress/);
    assert.match(edgeFn, /onboarding_plans/);
  });

  it('allows HR to write onboarding plans', () => {
    assert.match(migration, /onboarding_plans_write_hr/);
  });

  it('includes new hire feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/new-hire');
    for (const file of ['NewHirePage.tsx', 'useNewHire.ts', 'newHire.logic.ts']) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

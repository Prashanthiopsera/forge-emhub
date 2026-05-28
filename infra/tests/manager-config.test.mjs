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

describe('Manager dashboard wiring (WO-026)', () => {
  it('wires /team-progress to ManagerDashboardPage', () => {
    assert.match(routes, /path="\/team-progress"\s+element=\{<ManagerDashboardPage\s*\/>\}/);
  });

  it('includes manager feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/manager');
    for (const file of [
      'ManagerDashboardPage.tsx',
      'useTeamProgress.ts',
      'manager.fixtures.ts',
      'manager.logic.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

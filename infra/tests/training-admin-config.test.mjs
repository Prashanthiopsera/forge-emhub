import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(join(root, '../frontend/src/app/routes.tsx'), 'utf8');
const permissions = readFileSync(
  join(root, '../frontend/src/features/auth/permissions.ts'),
  'utf8',
);
const logic = readFileSync(
  join(root, '../frontend/src/features/training-admin/trainingAdmin.logic.ts'),
  'utf8',
);

describe('HR Training admin (WO-018)', () => {
  it('wires /admin/training to TrainingAdminPage', () => {
    assert.match(routes, /path="\/admin\/training"\s+element=\{<TrainingAdminPage\s*\/>\}/);
  });

  it('restricts training admin to hr_admin', () => {
    assert.match(permissions, /'\/admin\/training':\s*\['hr_admin'\]/);
  });

  it('validates Vimeo and Wistia embed URLs', () => {
    assert.match(logic, /parseVideoEmbedUrl/);
    assert.match(logic, /vimeo/);
    assert.match(logic, /wistia/);
  });

  it('includes training admin feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/training-admin');
    for (const file of ['TrainingAdminPage.tsx', 'useTrainingAdmin.ts', 'trainingAdmin.logic.ts']) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

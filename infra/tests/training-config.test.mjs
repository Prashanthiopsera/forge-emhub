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
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000003_training_catalog_columns.sql'),
  'utf8',
);

const alexId = 'u1000000-0000-4000-8000-000000000001';

describe('Training seed and wiring (WO-016)', () => {
  it('adds catalog columns for training modules', () => {
    assert.match(migration, /category TEXT/);
    assert.match(migration, /description TEXT/);
  });

  it('seeds five training modules and video progress for alex.newhire', () => {
    assert.match(seed, /INSERT INTO public\.training_modules/);
    assert.match(seed, /INSERT INTO public\.video_progress/);
    assert.match(seed, /m1000000-0000-4000-8000-000000000001/);
    assert.match(seed, /vimeo/);
    assert.match(seed, /wistia/);
    assert.match(seed, new RegExp(alexId));
  });

  it('wires /training to TrainingCatalogPage', () => {
    assert.match(routes, /path="\/training"\s+element=\{<TrainingCatalogPage\s*\/>\}/);
  });

  it('includes training feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/training');
    for (const file of [
      'TrainingCatalogPage.tsx',
      'VideoPlayer.tsx',
      'useTrainingProgress.ts',
      'training.fixtures.ts',
      'training.logic.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const appShell = readFileSync(
  join(root, '../frontend/src/app/AppShell.tsx'),
  'utf8',
);

describe('Product tour wiring (WO-029)', () => {
  it('seeds tour_complete auto-complete task', () => {
    assert.match(seed, /tour_complete/);
    assert.match(seed, /tt100000-0000-4000-8000-00000000006/);
  });

  it('mounts ProductTour in AppShell', () => {
    assert.match(appShell, /<ProductTour\s*\/>/);
  });

  it('includes tour feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/tour');
    for (const file of [
      'ProductTour.tsx',
      'useProductTour.ts',
      'tour.logic.ts',
      'tour.constants.ts',
      'completeTourChecklistTask.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

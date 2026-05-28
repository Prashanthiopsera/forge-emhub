import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000009_task_auto_complete.sql'),
  'utf8',
);
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');

describe('Task auto-completion (WO-013)', () => {
  it('adds auto_complete_event and completed_by columns', () => {
    assert.match(migration, /auto_complete_event/);
    assert.match(migration, /completed_by/);
    assert.match(migration, /auto_complete_tasks_for_event/);
  });

  it('seeds auto-complete event for security training task', () => {
    assert.match(seed, /auto_complete_event/);
    assert.match(seed, /video_complete:m1000000-0000-4000-8000-000000000002/);
  });

  it('includes autoComplete service and tests', () => {
    const dir = join(root, '../frontend/src/features/checklist');
    assert.ok(existsSync(join(dir, 'autoComplete.ts')));
    assert.ok(existsSync(join(dir, 'autoComplete.test.ts')));
  });
});

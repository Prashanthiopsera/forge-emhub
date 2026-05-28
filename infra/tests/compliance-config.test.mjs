import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000007_compliance_due_offsets.sql'),
  'utf8',
);
const edgeFn = readFileSync(
  join(root, 'supabase/functions/compliance-reminders/index.ts'),
  'utf8',
);
const dueDateLib = readFileSync(
  join(root, '../frontend/src/lib/dueDate.ts'),
  'utf8',
);

describe('Compliance deadlines (WO-015)', () => {
  it('adds due_date_offset_days to template_tasks', () => {
    assert.match(migration, /due_date_offset_days/);
  });

  it('seeds overdue, due today, and upcoming task_progress rows', () => {
    assert.match(seed, /due_date_offset_days/);
    assert.match(seed, /CURRENT_DATE - 3/);
    assert.match(seed, /CURRENT_DATE - 4/);
    assert.match(seed, /CURRENT_DATE \+ 1/);
    assert.match(seed, /CURRENT_DATE,\s*\n\s*NULL/);
  });

  it('includes compliance-reminders edge function stub', () => {
    assert.ok(existsSync(join(root, 'supabase/functions/compliance-reminders/index.ts')));
    assert.match(edgeFn, /compliance_reminder/);
    assert.match(edgeFn, /compliance_escalation/);
  });

  it('includes due date helper in frontend', () => {
    assert.match(dueDateLib, /computeTaskDueAt/);
    assert.match(dueDateLib, /reminderKindForTask/);
    assert.match(dueDateLib, /escalationLevelForOverdueDays/);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(join(root, '../frontend/src/app/routes.tsx'), 'utf8');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000005_chatbot_metadata_hr_escalations.sql'),
  'utf8',
);

describe('HR Escalations (WO-022)', () => {
  it('wires /admin/escalations to EscalationsPage', () => {
    assert.match(routes, /path="\/admin\/escalations"\s+element=\{<EscalationsPage\s*\/>\}/);
    assert.ok(existsSync(join(root, '../frontend/src/features/escalations/EscalationsPage.tsx')));
  });

  it('allows HR to reply on escalated sessions', () => {
    assert.match(migration, /chat_messages_insert_hr/);
    assert.match(migration, /notifications_insert_escalation/);
  });

  it('seeds an escalated chat session', () => {
    assert.match(seed, /cs100000-0000-4000-8000-000000000002/);
    assert.match(seed, /WO-022: Escalated chat/);
    assert.match(seed, /relocation stipend/);
  });
});

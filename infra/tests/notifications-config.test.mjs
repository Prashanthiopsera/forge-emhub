import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const appShell = readFileSync(join(root, '../frontend/src/app/AppShell.tsx'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000004_notifications_in_app.sql'),
  'utf8',
);

const alexId = 'a1000000-0000-4000-8000-000000000001';

describe('In-app notifications (WO-030)', () => {
  it('seeds in_app notifications for test users', () => {
    assert.match(seed, /INSERT INTO public\.notifications/);
    assert.match(seed, /'in_app'/);
    assert.match(seed, new RegExp(alexId));
    assert.match(seed, /a3000000-0000-4000-8000-000000000001/);
  });

  it('allows users to mark own notifications read and enables realtime', () => {
    assert.match(migration, /notifications_update_own/);
    assert.match(migration, /user_id = auth\.uid\(\)/);
    assert.match(migration, /supabase_realtime/);
    assert.match(migration, /public\.notifications/);
  });

  it('wires NotificationBell into AppShell header', () => {
    assert.match(appShell, /NotificationBell/);
  });

  it('includes notification feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/notifications');
    for (const file of [
      'NotificationBell.tsx',
      'NotificationPanel.tsx',
      'useNotifications.ts',
      'notifications.logic.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

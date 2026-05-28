import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const migration = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../supabase/migrations/20260528000001_row_level_security.sql'),
  'utf8',
);

const tables = [
  'departments',
  'profiles',
  'onboarding_templates',
  'template_tasks',
  'onboarding_plans',
  'task_progress',
  'training_modules',
  'video_progress',
  'quizzes',
  'quiz_questions',
  'quiz_attempts',
  'faq_categories',
  'faq_articles',
  'org_chart_nodes',
  'chat_sessions',
  'chat_messages',
  'notifications',
  'audit_log',
];

describe('RLS migration (WO-006)', () => {
  it('enables RLS on every public table', () => {
    for (const table of tables) {
      assert.match(
        migration,
        new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`),
        `missing RLS enable for ${table}`,
      );
    }
  });

  it('defines role helper functions and IT provisioning policy', () => {
    assert.match(migration, /current_app_role/);
    assert.match(migration, /is_hr_admin/);
    assert.match(migration, /is_direct_report/);
    assert.match(migration, /notifications_update_it_provisioning/);
    assert.match(migration, /provisioning/);
  });

  it('restricts employee updates to own task_progress', () => {
    assert.match(migration, /task_progress_update_own/);
    assert.match(migration, /user_id = auth\.uid\(\)/);
  });
});

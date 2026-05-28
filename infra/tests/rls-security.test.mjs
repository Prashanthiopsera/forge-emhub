import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rls = readFileSync(join(root, 'supabase/migrations/20260528000001_row_level_security.sql'), 'utf8');
const matrix = readFileSync(join(root, 'supabase/docs/rls-access-matrix.md'), 'utf8');
const queries = readFileSync(join(root, 'supabase/tests/rls_role_queries.sql'), 'utf8');

const ROLES = ['employee', 'manager', 'hr_admin', 'it_ops'];
const TABLES = [
  'profiles',
  'task_progress',
  'onboarding_plans',
  'training_modules',
  'video_progress',
  'notifications',
  'audit_log',
  'faq_articles',
  'chat_sessions',
  'chat_messages',
];

describe('RLS security test suite (WO-038)', () => {
  it('documents role matrix for all four roles', () => {
    for (const role of ROLES) {
      assert.match(matrix, new RegExp(role, 'i'), `matrix missing ${role}`);
    }
  });

  it('defines isolation policies per sensitive table', () => {
    assert.match(rls, /task_progress_select/);
    assert.match(rls, /task_progress_update_own/);
    assert.match(rls, /audit_log_select_hr/);
    assert.match(rls, /notifications_update_it_provisioning/);
    assert.match(rls, /is_direct_report/);
  });

  it('includes SQL validation queries for cross-role boundaries', () => {
    assert.match(queries, /employee/i);
    assert.match(queries, /Manager/i);
    assert.match(queries, /HR admin/i);
    assert.match(queries, /IT ops/i);
    assert.match(queries, /auth\.uid/);
  });

  it('has RLS enabled on every table in the security matrix', () => {
    for (const table of TABLES) {
      assert.match(
        rls,
        new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`),
        `missing RLS for ${table}`,
      );
    }
  });

  it('prevents employee cross-user task_progress reads', () => {
    assert.match(rls, /user_id = auth\.uid\(\)/);
    assert.match(queries, /user_id <> auth\.uid/);
  });
});

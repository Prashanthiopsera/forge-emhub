import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000000_core_schema.sql'),
  'utf8',
);
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');

describe('Core schema migration (WO-005)', () => {
  it('defines template vs instance tables', () => {
    assert.match(migration, /onboarding_templates/);
    assert.match(migration, /template_tasks/);
    assert.match(migration, /task_progress/);
    assert.match(migration, /video_progress/);
  });

  it('annotates PII columns and adds FTS indexes', () => {
    assert.match(migration, /PII: GDPR deletion target/);
    assert.match(migration, /idx_faq_articles_search/);
    assert.match(migration, /idx_org_chart_nodes_search/);
  });

  it('includes audit_log and row audit triggers', () => {
    assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.audit_log/);
    assert.match(migration, /audit_row_change/);
  });
});

describe('Seed script (WO-005)', () => {
  it('seeds departments, users, templates, FAQ, org chart, and training', () => {
    assert.match(seed, /INSERT INTO public\.departments/);
    assert.match(seed, /INSERT INTO public\.onboarding_templates/);
    assert.match(seed, /INSERT INTO public\.faq_articles/);
    assert.match(seed, /INSERT INTO public\.org_chart_nodes/);
    assert.match(seed, /INSERT INTO public\.training_modules/);
    assert.match(seed, /INSERT INTO public\.video_progress/);
  });

  it('seed file exists and config references it', () => {
    const config = readFileSync(join(root, 'supabase/config.toml'), 'utf8');
    assert.ok(existsSync(join(root, 'supabase/seed.sql')));
    assert.match(config, /seed\.sql/);
  });
});

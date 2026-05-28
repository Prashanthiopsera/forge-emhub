import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(join(root, '../frontend/src/app/routes.tsx'), 'utf8');

describe('FAQ Admin (WO-025)', () => {
  it('wires /admin/faq to FaqAdminPage', () => {
    assert.match(routes, /path="\/admin\/faq"\s+element=\{<FaqAdminPage\s*\/>\}/);
    assert.ok(existsSync(join(root, '../frontend/src/features/faq-admin/FaqAdminPage.tsx')));
  });

  it('flags stale articles after 90 days', () => {
    const logic = readFileSync(
      join(root, '../frontend/src/features/faq-admin/faqAdmin.logic.ts'),
      'utf8',
    );
    assert.match(logic, /FAQ_STALE_DAYS = 90/);
    assert.ok(existsSync(join(root, '../frontend/src/features/faq-admin/faqAdmin.logic.test.ts')));
  });
});

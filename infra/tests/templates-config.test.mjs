import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(
  join(root, '../frontend/src/app/routes.tsx'),
  'utf8',
);

describe('Templates seed and wiring (WO-014)', () => {
  it('wires /admin/templates to TemplateManagementPage', () => {
    assert.match(routes, /path="\/admin\/templates"\s+element=\{<TemplateManagementPage\s*\/>\}/);
  });

  it('includes templates feature sources', () => {
    const featureDir = join(root, '../frontend/src/features/templates');
    for (const file of [
      'TemplateManagementPage.tsx',
      'TemplatePreview.tsx',
      'useTemplates.ts',
      'templates.fixtures.ts',
      'templates.logic.ts',
    ]) {
      assert.ok(existsSync(join(featureDir, file)), `missing ${file}`);
    }
  });
});

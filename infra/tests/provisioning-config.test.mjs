import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(join(root, '../frontend/src/app/routes.tsx'), 'utf8');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');

describe('IT Provisioning (WO-028)', () => {
  it('wires /provisioning to ProvisioningPage', () => {
    assert.match(routes, /path="\/provisioning"\s+element=\{<ProvisioningPage\s*\/>\}/);
    assert.ok(existsSync(join(root, '../frontend/src/features/provisioning/ProvisioningPage.tsx')));
  });

  it('seeds IT Ops target_role provisioning notifications', () => {
    assert.match(seed, /target_role.*it_ops|'it_ops'/);
    assert.match(seed, /"type": "provisioning"/);
  });

  it('includes provisioning feature logic', () => {
    assert.ok(existsSync(join(root, '../frontend/src/features/provisioning/useProvisioning.ts')));
    assert.ok(existsSync(join(root, '../frontend/src/features/provisioning/provisioning.logic.test.ts')));
  });
});

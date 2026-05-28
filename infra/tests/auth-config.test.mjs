import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000002_auth_jwt_role_claim.sql'),
  'utf8',
);
const config = readFileSync(join(root, 'supabase/config.toml'), 'utf8');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');

describe('Auth migration and config (WO-008)', () => {
  it('defines custom_access_token_hook and new-user profile trigger', () => {
    assert.match(migration, /custom_access_token_hook/);
    assert.match(migration, /handle_new_user/);
    assert.match(migration, /on_auth_user_created/);
    assert.match(migration, /'\{role\}'/);
  });

  it('enables custom access token hook in config', () => {
    assert.match(config, /\[auth\.hook\.custom_access_token\]/);
    assert.match(config, /custom_access_token_hook/);
  });

  it('seeds test users for each app role', () => {
    for (const role of ['employee', 'manager', 'hr_admin', 'it_ops']) {
      assert.match(seed, new RegExp(`'${role}'`));
    }
    assert.match(seed, /hr\.admin@emhub\.local/);
    assert.match(seed, /hr\.programs@emhub\.local/);
  });

  it('enables TOTP MFA enrollment and verification (WO-010)', () => {
    assert.match(config, /\[auth\.mfa\.totp\]/);
    assert.match(config, /enroll_enabled\s*=\s*true/);
    assert.match(config, /verify_enabled\s*=\s*true/);
  });
});

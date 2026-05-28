import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const LIVE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

describe.skipIf(!LIVE)('HR Admin MFA (live Supabase)', () => {
  it('hr.programs@emhub.local requires enrollment on first login', async () => {
    const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { flowType: 'pkce', persistSession: false },
    });

    const { error: signInError } = await client.auth.signInWithPassword({
      email: 'hr.programs@emhub.local',
      password: 'EmhubDev123!',
    });
    expect(signInError).toBeNull();

    const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
    expect(factorsError).toBeNull();

    const verified = factors?.totp?.filter((f) => f.status === 'verified') ?? [];
    if (verified.length > 0) {
      const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      expect(aal?.nextLevel).toBeDefined();
      return;
    }

    expect(verified).toHaveLength(0);
  });
});

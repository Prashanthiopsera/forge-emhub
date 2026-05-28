import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { getRoleFromSession } from './jwt';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const LIVE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

describe.skipIf(!LIVE)('Auth login flow (live Supabase)', () => {
  it('signs in seed HR admin and returns JWT with role claim', async () => {
    const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { flowType: 'pkce', persistSession: false },
    });

    const { data, error } = await client.auth.signInWithPassword({
      email: 'hr.admin@emhub.local',
      password: 'EmhubDev123!',
    });

    expect(error).toBeNull();
    expect(data.session).not.toBeNull();
    expect(getRoleFromSession(data.session)).toBe('hr_admin');
  });
});

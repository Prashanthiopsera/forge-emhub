import { describe, expect, it, vi } from 'vitest';
import { getRequiredEnv, validateSupabaseEnv } from './env';

describe('env validation (WO-007)', () => {
  it('throws when required env is missing', () => {
    vi.unstubAllEnvs();
    expect(() => getRequiredEnv('VITE_SUPABASE_URL')).toThrow(/Missing required environment variable/);
  });

  it('passes when all required env vars are set', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'key');
    expect(() => validateSupabaseEnv()).not.toThrow();
  });
});

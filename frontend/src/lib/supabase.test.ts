import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createSupabaseClient } from './supabase';

describe('Supabase client (WO-007)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  it('creates a typed client when env vars are set', () => {
    const client = createSupabaseClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });

  it('exposes typed table names via Database generic', () => {
    const client = createSupabaseClient();
    const query = client.from('profiles').select('id, email, role');
    expect(query).toBeDefined();
  });
});

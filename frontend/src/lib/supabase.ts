import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { getRequiredEnv } from '@/lib/env';

export type TypedSupabaseClient = SupabaseClient<Database>;

let client: TypedSupabaseClient | null = null;

export function createSupabaseClient(): TypedSupabaseClient {
  return createClient<Database>(getRequiredEnv('VITE_SUPABASE_URL'), getRequiredEnv('VITE_SUPABASE_ANON_KEY'), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/** Singleton Supabase client for the SPA. */
export function getSupabase(): TypedSupabaseClient {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

/** Typed helper for common profile lookup. */
export async function fetchCurrentProfile(userId: string) {
  return getSupabase().from('profiles').select('*').eq('id', userId).maybeSingle();
}

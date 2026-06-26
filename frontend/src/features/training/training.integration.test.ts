import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { ALEX_USER_ID } from '@/features/training/training.fixtures';
import { isVideoCompleted } from '@/features/training/training.logic';
import { fetchTrainingFromSupabase, upsertVideoProgress } from '@/features/training/useTrainingProgress';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const LIVE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

describe.skipIf(!LIVE)('Training progress (live Supabase)', () => {
  it('loads seed modules and updates video_progress for alex.newhire', async () => {
    const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { flowType: 'pkce', persistSession: false },
    });

    const { error: signInError } = await client.auth.signInWithPassword({
      email: 'alex.newhire@emhub.local',
      password: 'EmhubDev123!',
    });
    expect(signInError).toBeNull();

    const catalog = await fetchTrainingFromSupabase(ALEX_USER_ID);
    expect(catalog).not.toBeNull();
    expect(catalog!.modules.length).toBeGreaterThanOrEqual(5);

    const target = catalog!.modules.find((module) => module.id === 'e1000000-0000-4000-8000-000000000004');
    expect(target).toBeDefined();

    const watchedSeconds = Math.ceil(target!.durationSeconds * 0.91);
    expect(isVideoCompleted(watchedSeconds, target!.durationSeconds)).toBe(true);

    await upsertVideoProgress(ALEX_USER_ID, { ...target!, watchedSeconds }, watchedSeconds);

    const { data: progressRow } = await client
      .from('video_progress')
      .select('watched_seconds, completed')
      .eq('user_id', ALEX_USER_ID)
      .eq('module_id', target!.id)
      .maybeSingle();

    expect(progressRow?.completed).toBe(true);
    expect(progressRow?.watched_seconds).toBeGreaterThanOrEqual(watchedSeconds);
  });
});

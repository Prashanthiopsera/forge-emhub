import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';

export type AutoCompleteEventType =
  | `video_complete:${string}`
  | `quiz_pass:${string}`
  | 'tour_complete';

export function buildVideoCompleteEvent(moduleId: string): AutoCompleteEventType {
  return `video_complete:${moduleId}`;
}

export function buildQuizPassEvent(moduleId: string): AutoCompleteEventType {
  return `quiz_pass:${moduleId}`;
}

export async function autoCompleteTask(
  userId: string,
  eventType: AutoCompleteEventType,
  client: SupabaseClient = getSupabase(),
): Promise<{ updatedCount: number; error: string | null }> {
  const { data, error } = await client.rpc('auto_complete_tasks_for_event', {
    p_user_id: userId,
    p_event_type: eventType,
  });

  if (error) {
    return { updatedCount: 0, error: error.message };
  }

  return { updatedCount: typeof data === 'number' ? data : 0, error: null };
}

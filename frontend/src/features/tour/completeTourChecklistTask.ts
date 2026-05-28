import { autoCompleteTask } from '@/features/checklist/autoComplete';
import { TOUR_COMPLETE_EVENT } from '@/features/tour/tour.constants';

/** Fires checklist auto-complete for tour_complete event tasks (WO-029). */
export async function completeTourChecklistTask(userId: string): Promise<{ error: string | null }> {
  const { error } = await autoCompleteTask(userId, TOUR_COMPLETE_EVENT);
  return { error };
}

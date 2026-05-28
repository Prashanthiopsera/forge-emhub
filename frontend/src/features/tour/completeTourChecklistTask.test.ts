import { describe, expect, it, vi } from 'vitest';
import { completeTourChecklistTask } from '@/features/tour/completeTourChecklistTask';
import { TOUR_COMPLETE_EVENT } from '@/features/tour/tour.constants';

vi.mock('@/features/checklist/autoComplete', () => ({
  autoCompleteTask: vi.fn(),
}));

import { autoCompleteTask } from '@/features/checklist/autoComplete';

const mockAutoComplete = vi.mocked(autoCompleteTask);

describe('completeTourChecklistTask (WO-029)', () => {
  it('delegates to auto_complete_tasks_for_event with tour_complete', async () => {
    mockAutoComplete.mockResolvedValue({ updatedCount: 1, error: null });

    const result = await completeTourChecklistTask('u1000000-0000-4000-8000-000000000001');

    expect(mockAutoComplete).toHaveBeenCalledWith(
      'u1000000-0000-4000-8000-000000000001',
      TOUR_COMPLETE_EVENT,
    );
    expect(result.error).toBeNull();
  });
});

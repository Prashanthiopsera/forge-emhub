import { describe, expect, it, vi } from 'vitest';
import {
  autoCompleteTask,
  buildQuizPassEvent,
  buildVideoCompleteEvent,
  type AutoCompleteEventType,
} from '@/features/checklist/autoComplete';

describe('autoComplete (WO-013)', () => {
  it('builds event type strings for training modules', () => {
    const moduleId = 'e1000000-0000-4000-8000-000000000002';
    expect(buildVideoCompleteEvent(moduleId)).toBe(`video_complete:${moduleId}`);
    expect(buildQuizPassEvent(moduleId)).toBe(`quiz_pass:${moduleId}`);
  });

  it('calls auto_complete_tasks_for_event RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    const client = { rpc } as never;

    const result = await autoCompleteTask(
      'a1000000-0000-4000-8000-000000000001',
      buildVideoCompleteEvent('e1000000-0000-4000-8000-000000000002'),
      client,
    );

    expect(rpc).toHaveBeenCalledWith('auto_complete_tasks_for_event', {
      p_user_id: 'a1000000-0000-4000-8000-000000000001',
      p_event_type: 'video_complete:e1000000-0000-4000-8000-000000000002',
    });
    expect(result.updatedCount).toBe(1);
    expect(result.error).toBeNull();
  });

  it('supports tour_complete event type', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    const client = { rpc } as never;
    const event: AutoCompleteEventType = 'tour_complete';

    await autoCompleteTask('a1000000-0000-4000-8000-000000000001', event, client);

    expect(rpc).toHaveBeenCalledWith('auto_complete_tasks_for_event', {
      p_user_id: 'a1000000-0000-4000-8000-000000000001',
      p_event_type: 'tour_complete',
    });
  });

  it('returns error message when RPC fails', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'not authorized' } });
    const client = { rpc } as never;

    const result = await autoCompleteTask(
      'a1000000-0000-4000-8000-000000000001',
      buildQuizPassEvent('e1000000-0000-4000-8000-000000000002'),
      client,
    );

    expect(result.updatedCount).toBe(0);
    expect(result.error).toBe('not authorized');
  });
});

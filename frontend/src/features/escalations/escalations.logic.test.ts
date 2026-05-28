import { describe, expect, it } from 'vitest';
import {
  filterOpenEscalations,
  sortEscalationsByUpdated,
} from '@/features/escalations/escalations.logic';
import type { ChatSessionView } from '@/features/chatbot/chatbot.types';

const base: ChatSessionView = {
  id: 's1',
  userId: 'u1',
  status: 'open',
  escalated: true,
  createdAt: '2026-05-27T10:00:00.000Z',
  updatedAt: '2026-05-27T10:00:00.000Z',
};

describe('escalations.logic (WO-022)', () => {
  it('filters open escalated sessions only', () => {
    const sessions: ChatSessionView[] = [
      base,
      { ...base, id: 's2', escalated: false },
      { ...base, id: 's3', status: 'resolved' },
    ];
    expect(filterOpenEscalations(sessions)).toHaveLength(1);
    expect(filterOpenEscalations(sessions)[0]?.id).toBe('s1');
  });

  it('sorts by most recently updated', () => {
    const sessions: ChatSessionView[] = [
      { ...base, id: 'old', updatedAt: '2026-05-26T10:00:00.000Z' },
      { ...base, id: 'new', updatedAt: '2026-05-27T12:00:00.000Z' },
    ];
    const sorted = sortEscalationsByUpdated(sessions);
    expect(sorted[0]?.id).toBe('new');
  });
});

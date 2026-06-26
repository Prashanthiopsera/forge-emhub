import { describe, expect, it } from 'vitest';
import { buildChatFixture } from '@/features/chatbot/chatbot.fixtures';
import { formatChatTimestamp, sortMessagesChronologically } from '@/features/chatbot/chatbot.logic';

describe('chatbot.logic (WO-020)', () => {
  it('sorts messages chronologically', () => {
    const { messages } = buildChatFixture();
    const reversed = [...messages].reverse();
    const sorted = sortMessagesChronologically(reversed);
    expect(sorted[0].id).toBe('d3000000-0000-4000-8000-000000000001');
  });

  it('formats timestamps for display', () => {
    expect(formatChatTimestamp('2026-05-20T10:00:00.000Z')).toMatch(/May/);
  });
});

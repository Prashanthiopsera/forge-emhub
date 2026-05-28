import { afterEach, describe, expect, it } from 'vitest';
import {
  chatResponsesRemaining,
  clearChatRateLimit,
  isChatRateLimited,
  recordChatBotResponse,
} from '@/features/chatbot/rateLimit';

describe('chat rate limit (WO-021)', () => {
  const key = 'test-user-chat';

  afterEach(() => {
    clearChatRateLimit(key);
  });

  it('allows up to 20 bot responses per hour', () => {
    const now = Date.now();
    for (let i = 0; i < 20; i += 1) {
      recordChatBotResponse(key, now + i);
    }
    expect(isChatRateLimited(key, now + 20)).toBe(true);
    expect(chatResponsesRemaining(key, now + 20)).toBe(0);
  });

  it('is not limited before 20 responses', () => {
    recordChatBotResponse(key);
    expect(isChatRateLimited(key)).toBe(false);
    expect(chatResponsesRemaining(key)).toBe(19);
  });
});

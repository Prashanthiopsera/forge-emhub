import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearMfaRateLimit,
  isMfaRateLimited,
  mfaAttemptsRemaining,
  mfaRateLimitWindowMs,
  recordMfaFailedAttempt,
} from './rateLimit';

describe('mfa rateLimit (WO-010)', () => {
  const key = 'test-user';

  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('allows attempts until the fifth failure in the window', () => {
    const now = 1_000_000;
    for (let i = 0; i < 4; i += 1) {
      recordMfaFailedAttempt(key, now + i);
      expect(isMfaRateLimited(key, now + i)).toBe(false);
    }
    recordMfaFailedAttempt(key, now + 4);
    expect(isMfaRateLimited(key, now + 4)).toBe(true);
    expect(mfaAttemptsRemaining(key, now + 4)).toBe(0);
  });

  it('expires attempts outside the 15 minute window', () => {
    const now = 2_000_000;
    for (let i = 0; i < 5; i += 1) {
      recordMfaFailedAttempt(key, now);
    }
    expect(isMfaRateLimited(key, now)).toBe(true);

    const afterWindow = now + mfaRateLimitWindowMs() + 1;
    expect(isMfaRateLimited(key, afterWindow)).toBe(false);
    expect(mfaAttemptsRemaining(key, afterWindow)).toBe(5);
  });

  it('clears stored attempts', () => {
    recordMfaFailedAttempt(key);
    clearMfaRateLimit(key);
    expect(isMfaRateLimited(key)).toBe(false);
  });
});

const STORAGE_PREFIX = 'emhub:mfa-rate:';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export interface MfaRateLimitState {
  attempts: number[];
}

function readState(key: string): MfaRateLimitState {
  if (typeof localStorage === 'undefined') {
    return { attempts: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return { attempts: [] };
    const parsed = JSON.parse(raw) as MfaRateLimitState;
    if (!Array.isArray(parsed.attempts)) return { attempts: [] };
    return { attempts: parsed.attempts.filter((t) => typeof t === 'number') };
  } catch {
    return { attempts: [] };
  }
}

function writeState(key: string, state: MfaRateLimitState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
}

function pruneAttempts(attempts: number[], now: number): number[] {
  return attempts.filter((t) => now - t < WINDOW_MS);
}

/** Returns true when the user has exceeded failed MFA attempts in the rolling window. */
export function isMfaRateLimited(key: string, now = Date.now()): boolean {
  const { attempts } = readState(key);
  return pruneAttempts(attempts, now).length >= MAX_ATTEMPTS;
}

/** Records a failed MFA verification attempt. */
export function recordMfaFailedAttempt(key: string, now = Date.now()): void {
  const pruned = pruneAttempts(readState(key).attempts, now);
  pruned.push(now);
  writeState(key, { attempts: pruned });
}

/** Clears rate-limit state after successful verification or for tests. */
export function clearMfaRateLimit(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function mfaAttemptsRemaining(key: string, now = Date.now()): number {
  const used = pruneAttempts(readState(key).attempts, now).length;
  return Math.max(0, MAX_ATTEMPTS - used);
}

export function mfaRateLimitWindowMs(): number {
  return WINDOW_MS;
}

const STORAGE_PREFIX = 'emhub:chat-rate:';
const MAX_MESSAGES = 20;
const WINDOW_MS = 60 * 60 * 1000;

export interface ChatRateLimitState {
  attempts: number[];
}

function readState(key: string): ChatRateLimitState {
  if (typeof localStorage === 'undefined') {
    return { attempts: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return { attempts: [] };
    const parsed = JSON.parse(raw) as ChatRateLimitState;
    if (!Array.isArray(parsed.attempts)) return { attempts: [] };
    return { attempts: parsed.attempts.filter((t) => typeof t === 'number') };
  } catch {
    return { attempts: [] };
  }
}

function writeState(key: string, state: ChatRateLimitState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
}

function pruneAttempts(attempts: number[], now: number): number[] {
  return attempts.filter((t) => now - t < WINDOW_MS);
}

/** Returns true when the user exceeded 20 bot responses in the rolling hour (WO-021). */
export function isChatRateLimited(key: string, now = Date.now()): boolean {
  const { attempts } = readState(key);
  return pruneAttempts(attempts, now).length >= MAX_MESSAGES;
}

export function recordChatBotResponse(key: string, now = Date.now()): void {
  const pruned = pruneAttempts(readState(key).attempts, now);
  pruned.push(now);
  writeState(key, { attempts: pruned });
}

export function clearChatRateLimit(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function chatResponsesRemaining(key: string, now = Date.now()): number {
  const used = pruneAttempts(readState(key).attempts, now).length;
  return Math.max(0, MAX_MESSAGES - used);
}

export function chatRateLimitWindowMs(): number {
  return WINDOW_MS;
}

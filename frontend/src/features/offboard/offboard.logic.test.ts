import { describe, expect, it } from 'vitest';
import { daysUntilPiiDeletion, isReadyForPiiDeletion } from '@/features/offboard/offboard.logic';

describe('offboard.logic (WO-035)', () => {
  it('calculates days until PII deletion', () => {
    const offboarded = new Date('2026-01-01').toISOString();
    const now = new Date('2026-03-01');
    expect(daysUntilPiiDeletion(offboarded, now)).toBeGreaterThan(0);
    expect(isReadyForPiiDeletion(offboarded, new Date('2026-05-01'))).toBe(true);
  });
});

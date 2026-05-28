import { beforeEach, describe, expect, it } from 'vitest';
import {
  isTourCompleted,
  markTourCompleted,
  resetTourForTesting,
  shouldShowTour,
} from '@/features/tour/tour.logic';
import { TOUR_STORAGE_KEY } from '@/features/tour/tour.constants';

describe('tour.logic (WO-029)', () => {
  beforeEach(() => {
    resetTourForTesting();
  });

  it('tracks completion in localStorage', () => {
    expect(isTourCompleted()).toBe(false);
    markTourCompleted();
    expect(window.localStorage.getItem(TOUR_STORAGE_KEY)).toBe('true');
    expect(isTourCompleted()).toBe(true);
  });

  it('shows tour only for authenticated employees on first visit', () => {
    expect(shouldShowTour(true, 'employee')).toBe(true);
    expect(shouldShowTour(true, 'manager')).toBe(false);
    markTourCompleted();
    expect(shouldShowTour(true, 'employee')).toBe(false);
  });
});

import { TOUR_STORAGE_KEY } from '@/features/tour/tour.constants';

export function isTourCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
}

export function markTourCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOUR_STORAGE_KEY, 'true');
}

export function resetTourForTesting(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOUR_STORAGE_KEY);
}

export function shouldShowTour(isAuthenticated: boolean, role: string | null): boolean {
  if (!isAuthenticated || !role) return false;
  if (role !== 'employee') return false;
  return !isTourCompleted();
}

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { completeTourChecklistTask } from '@/features/tour/completeTourChecklistTask';
import { TOUR_STEPS } from '@/features/tour/tour.constants';
import { markTourCompleted, shouldShowTour } from '@/features/tour/tour.logic';

export function useProductTour() {
  const { user, role, loading } = useAuth();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (loading) return;
    setActive(shouldShowTour(Boolean(user), role));
    setStepIndex(0);
  }, [loading, user, role]);

  const currentStep = TOUR_STEPS[stepIndex] ?? null;
  const isLastStep = stepIndex >= TOUR_STEPS.length - 1;

  const finishTour = useCallback(async () => {
    markTourCompleted();
    setActive(false);
    if (user?.id) {
      await completeTourChecklistTask(user.id);
    }
  }, [user?.id]);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      void finishTour();
      return;
    }
    setStepIndex((index) => Math.min(index + 1, TOUR_STEPS.length - 1));
  }, [finishTour, isLastStep]);

  const skipTour = useCallback(() => {
    void finishTour();
  }, [finishTour]);

  return {
    active,
    stepIndex,
    currentStep,
    isLastStep,
    totalSteps: TOUR_STEPS.length,
    nextStep,
    skipTour,
  };
}

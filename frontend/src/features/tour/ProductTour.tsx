import { useEffect } from 'react';
import { useProductTour } from '@/features/tour/useProductTour';

const TOUR_HIGHLIGHT_CLASS = 'ring-2 ring-brand-500 ring-offset-2 bg-brand-50';

export function ProductTour() {
  const { active, currentStep, stepIndex, totalSteps, isLastStep, nextStep, skipTour } =
    useProductTour();

  useEffect(() => {
    if (!active || !currentStep) return;

    const selector = `[data-tour-nav="${currentStep.path}"]`;
    const target = document.querySelector<HTMLElement>(selector);
    document.querySelectorAll('[data-tour-nav].tour-nav-highlight').forEach((el) => {
      el.classList.remove('tour-nav-highlight', ...TOUR_HIGHLIGHT_CLASS.split(' '));
    });
    if (target) {
      target.classList.add('tour-nav-highlight', ...TOUR_HIGHLIGHT_CLASS.split(' '));
      target.scrollIntoView({ block: 'nearest' });
    }

    return () => {
      target?.classList.remove('tour-nav-highlight', ...TOUR_HIGHLIGHT_CLASS.split(' '));
    };
  }, [active, currentStep]);

  if (!active || !currentStep) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-tour-title"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2 id="product-tour-title" className="mt-2 text-lg font-semibold text-slate-900">
          {currentStep.label}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{currentStep.description}</p>
        <p className="mt-2 text-xs text-slate-500">
          The <span className="font-medium">{currentStep.label}</span> item in the sidebar is
          highlighted — use Next to continue the tour.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={skipTour}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {isLastStep ? 'Finish tour' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

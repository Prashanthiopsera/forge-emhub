import { useProductTour } from '@/features/tour/useProductTour';

export function ProductTour() {
  const { active, currentStep, stepIndex, totalSteps, isLastStep, nextStep, skipTour } =
    useProductTour();

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
          Highlighting <span className="font-medium">{currentStep.path}</span> in the sidebar.
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

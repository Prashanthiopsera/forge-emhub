interface ProgressBarProps {
  percent: number;
  label?: string;
}

export function ProgressBar({ percent, label = 'Onboarding checklist completion' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Overall progress</span>
        <span className="font-semibold text-brand-700">{clamped}%</span>
      </div>
      <div
        className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

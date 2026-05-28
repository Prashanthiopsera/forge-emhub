import { FormEvent, useState } from 'react';
import { shouldShowSurvey, validateSurveyForm } from '@/features/survey/survey.logic';

type SurveyPromptProps = {
  startDate: string | null;
  onDismiss: () => void;
  onSubmit: (score: number) => void;
};

export function SurveyPrompt({ startDate, onDismiss, onSubmit }: SurveyPromptProps) {
  const [satisfaction, setSatisfaction] = useState(4);
  const [wentWell, setWentWell] = useState('');
  const [couldImprove, setCouldImprove] = useState('');
  const [recommend, setRecommend] = useState(8);
  const [error, setError] = useState<string | null>(null);

  if (!shouldShowSurvey(startDate)) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validateSurveyForm({
      satisfactionScore: satisfaction,
      wentWell,
      couldImprove,
      wouldRecommend: recommend,
    });
    if (validation) {
      setError(validation);
      return;
    }
    onSubmit(satisfaction);
  }

  return (
    <section
      aria-labelledby="survey-title"
      className="rounded-xl border border-brand-200 bg-brand-50 p-4"
      role="region"
    >
      <h2 id="survey-title" className="text-lg font-semibold text-slate-900">
        Day 30 onboarding survey
      </h2>
      <p className="mt-1 text-sm text-slate-600">Help us improve your onboarding experience.</p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Overall satisfaction (1–5)</span>
          <input
            type="number"
            min={1}
            max={5}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={satisfaction}
            onChange={(e) => setSatisfaction(Number(e.target.value))}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">What went well?</span>
          <textarea
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">What could improve?</span>
          <textarea
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={couldImprove}
            onChange={(e) => setCouldImprove(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Would you recommend (0–10)?</span>
          <input
            type="number"
            min={0}
            max={10}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={recommend}
            onChange={(e) => setRecommend(Number(e.target.value))}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          >
            Submit survey
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            onClick={onDismiss}
          >
            Remind me later
          </button>
        </div>
      </form>
    </section>
  );
}

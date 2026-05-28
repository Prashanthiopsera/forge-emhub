import { Link } from 'react-router-dom';
import {
  formatRoleLabel,
  formatStartDate,
  TIMELINE_PHASES,
} from '@/features/dashboard/dashboard.logic';
import type { OnboardingPhase } from '@/features/dashboard/dashboard.types';
import { useDashboardData } from '@/features/dashboard/useDashboardData';

function phaseLabel(phase: OnboardingPhase): string {
  return phase.replace(' ', '');
}

export function DashboardPage() {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading your dashboard…</p>;
  }

  if (!data) {
    return (
      <section aria-labelledby="dashboard-empty">
        <h1 id="dashboard-empty" className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-600">Sign in to view your personalized onboarding dashboard.</p>
      </section>
    );
  }

  const { profile, progressPercent, currentPhase, nextActions } = data;

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <header>
        <h1 id="dashboard-title" className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-600">Your personalized onboarding roadmap and timeline.</p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            Showing cached demo data ({error}).
          </p>
        ) : null}
        {data.source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo dashboard data.
          </p>
        ) : null}
      </header>

      <article
        className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm"
        aria-labelledby="welcome-heading"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Welcome back</p>
        <h2 id="welcome-heading" className="mt-1 text-2xl font-bold text-slate-900">
          {profile.fullName}
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Role</dt>
            <dd className="text-slate-900">{formatRoleLabel(profile.role)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Title</dt>
            <dd className="text-slate-900">{profile.jobTitle ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Department</dt>
            <dd className="text-slate-900">{profile.departmentName ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Start date</dt>
            <dd className="text-slate-900">{formatStartDate(profile.startDate)}</dd>
          </div>
        </dl>
      </article>

      <section aria-labelledby="timeline-heading" className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 id="timeline-heading" className="text-lg font-semibold text-slate-900">
          Onboarding timeline
        </h2>
        <ol className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
          {TIMELINE_PHASES.map((phase) => {
            const isCurrent = phase === currentPhase;
            return (
              <li
                key={phase}
                className={[
                  'flex-1 rounded-lg border px-4 py-3 text-center text-sm font-medium',
                  isCurrent
                    ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-slate-50 text-slate-600',
                ].join(' ')}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="block text-xs uppercase tracking-wide text-slate-500">Phase</span>
                <span className="mt-1 block text-base">{phaseLabel(phase)}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Overall progress</span>
            <span className="font-semibold text-brand-700">{progressPercent}%</span>
          </div>
          <div
            className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Onboarding completion"
          >
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="next-actions-heading" className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 id="next-actions-heading" className="text-lg font-semibold text-slate-900">
          Next actions
        </h2>
        {nextActions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">You are all caught up. Great work!</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {nextActions.map((task) => (
              <li key={task.id}>
                <Link
                  to="/checklist"
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm hover:border-brand-300 hover:bg-brand-50"
                >
                  <span>
                    <span className="font-medium text-slate-900">{task.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{task.phaseName}</span>
                  </span>
                  <span className="text-xs font-semibold uppercase text-brand-700">Open checklist</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

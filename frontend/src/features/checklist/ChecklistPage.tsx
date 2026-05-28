import { ProgressBar } from '@/features/checklist/ProgressBar';
import { TaskItem } from '@/features/checklist/TaskItem';
import { useChecklist } from '@/features/checklist/useChecklist';

function phaseHeading(phase: string): string {
  return phase.replace(' ', '');
}

export function ChecklistPage() {
  const { data, loading, error, completingId, markComplete } = useChecklist();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading your checklist…</p>;
  }

  if (!data) {
    return (
      <section aria-labelledby="checklist-empty">
        <h1 id="checklist-empty" className="text-2xl font-semibold text-slate-900">
          Onboarding Checklist
        </h1>
        <p className="mt-2 text-slate-600">Sign in to view and complete your onboarding tasks.</p>
      </section>
    );
  }

  const { phaseGroups, progressPercent, source } = data;

  return (
    <section aria-labelledby="checklist-title" className="space-y-6">
      <header>
        <h1 id="checklist-title" className="text-2xl font-semibold text-slate-900">
          Onboarding Checklist
        </h1>
        <p className="mt-1 text-slate-600">Track and complete your onboarding tasks by phase.</p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            {source === 'fixture' ? 'Showing demo checklist data' : 'Update failed'} ({error}).
          </p>
        ) : null}
        {source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo checklist data.
          </p>
        ) : null}
      </header>

      <section
        className="rounded-xl border border-slate-200 bg-white p-6"
        aria-labelledby="checklist-progress-heading"
      >
        <h2 id="checklist-progress-heading" className="sr-only">
          Progress
        </h2>
        <ProgressBar percent={progressPercent} />
      </section>

      {phaseGroups.length === 0 ? (
        <p className="text-sm text-slate-600">No tasks assigned yet.</p>
      ) : (
        phaseGroups.map((group) => (
          <section
            key={group.phase}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-6"
            aria-labelledby={`phase-${group.phase}`}
          >
            <h2
              id={`phase-${group.phase}`}
              className="text-lg font-semibold text-slate-900"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Phase
              </span>
              <span className="mt-1 block">{phaseHeading(group.phase)}</span>
            </h2>
            <ul className="mt-4 space-y-3">
              {group.tasks.map((task) => (
                <li key={task.id}>
                  <TaskItem
                    task={task}
                    completing={completingId === task.id}
                    onComplete={markComplete}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}

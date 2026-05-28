import {
  canMarkComplete,
  computeDaysOverdue,
  formatDueDate,
  isTaskOverdue,
} from '@/features/checklist/checklist.logic';
import type { ChecklistTask } from '@/features/checklist/checklist.types';

interface TaskItemProps {
  task: ChecklistTask;
  completing?: boolean;
  onComplete?: (taskId: string) => void;
}

function statusLabel(status: ChecklistTask['status']): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In progress';
    case 'skipped':
      return 'Skipped';
    default:
      return 'Pending';
  }
}

export function TaskItem({ task, completing = false, onComplete }: TaskItemProps) {
  const overdue = isTaskOverdue(task);
  const daysOverdue = computeDaysOverdue(task);
  const isCompleted = task.status === 'completed';
  const showComplete = canMarkComplete(task) && onComplete;

  return (
    <article
      className={[
        'rounded-lg border px-4 py-3',
        overdue ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white',
        isCompleted ? 'opacity-90' : '',
      ].join(' ')}
      aria-labelledby={`task-title-${task.id}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
            isCompleted
              ? 'border-green-600 bg-green-600 text-white'
              : 'border-slate-300 bg-white text-transparent',
          ].join(' ')}
          aria-hidden="true"
        >
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <h3
            id={`task-title-${task.id}`}
            className={[
              'text-sm font-semibold',
              isCompleted ? 'text-slate-500 line-through' : 'text-slate-900',
            ].join(' ')}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1 text-sm text-slate-600">{task.description}</p>
          ) : null}
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <div>
              <dt className="sr-only">Status</dt>
              <dd className="font-medium uppercase tracking-wide">{statusLabel(task.status)}</dd>
            </div>
            <div>
              <dt className="sr-only">Due date</dt>
              <dd>Due {formatDueDate(task.dueAt)}</dd>
            </div>
          </dl>
          {overdue ? (
            <p className="mt-2 text-sm font-semibold text-red-700" role="status">
              {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
            </p>
          ) : null}
        </div>
        {showComplete ? (
          <button
            type="button"
            className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onComplete(task.id)}
            disabled={completing}
            aria-busy={completing}
          >
            {completing ? 'Saving…' : 'Mark complete'}
          </button>
        ) : null}
      </div>
    </article>
  );
}

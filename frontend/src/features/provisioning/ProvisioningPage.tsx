import { formatNotificationTime } from '@/features/notifications/notifications.logic';
import { useProvisioning } from '@/features/provisioning/useProvisioning';

export function ProvisioningPage() {
  const { tasks, pendingCount, loading, error, source, markDone } = useProvisioning();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading provisioning tasks…</p>;
  }

  return (
    <section aria-labelledby="provisioning-title" className="space-y-6">
      <header>
        <h1 id="provisioning-title" className="text-2xl font-semibold text-slate-900">
          Provisioning Tasks
        </h1>
        <p className="mt-1 text-slate-600">
          IT onboarding work items from notifications (target role IT Ops or type provisioning).
        </p>
        <p className="mt-1 text-sm text-slate-500">{pendingCount} open tasks</p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            {error}
          </p>
        ) : null}
        {source === 'fixture' ? (
          <p className="mt-2 text-sm text-slate-500">Showing demo provisioning queue.</p>
        ) : null}
      </header>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-600">No provisioning tasks in the queue.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`rounded-xl border p-4 ${
                task.read ? 'border-slate-200 bg-slate-50' : 'border-brand-200 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">{task.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{task.body}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatNotificationTime(task.createdAt)} · {task.status}
                  </p>
                </div>
                {!task.read ? (
                  <button
                    type="button"
                    onClick={() => void markDone(task.id)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Mark done
                  </button>
                ) : (
                  <span className="text-xs font-medium uppercase text-slate-500">Completed</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

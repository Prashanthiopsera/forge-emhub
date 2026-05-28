import { useTeamProgress } from '@/features/manager/useTeamProgress';

export function ManagerDashboardPage() {
  const { data, loading, error } = useTeamProgress();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading team progress…</p>;
  }

  if (!data) {
    return (
      <section aria-labelledby="team-empty">
        <h1 id="team-empty" className="text-2xl font-semibold text-slate-900">
          Team Progress
        </h1>
        <p className="mt-2 text-slate-600">Sign in as a manager to view direct report onboarding.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="team-title" className="space-y-6">
      <header>
        <h1 id="team-title" className="text-2xl font-semibold text-slate-900">
          Team Progress
        </h1>
        <p className="mt-1 text-slate-600">
          Onboarding completion for your direct reports ({data.reports.length}).
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            Showing cached demo data ({error}).
          </p>
        ) : null}
      </header>

      {data.reports.length === 0 ? (
        <p className="text-sm text-slate-600">No direct reports assigned to you yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Phase</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Tasks</th>
                <th className="px-4 py-3 font-semibold">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {data.reports.map((report) => (
                <tr key={report.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{report.fullName}</p>
                    <p className="text-xs text-slate-500">{report.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{report.jobTitle ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{report.currentPhase}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-24 overflow-hidden rounded-full bg-slate-200"
                        role="progressbar"
                        aria-valuenow={report.progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${report.fullName} onboarding progress`}
                      >
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${report.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-slate-700">{report.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {report.completedTasks}/{report.totalTasks}
                  </td>
                  <td className="px-4 py-3">
                    {report.overdueCount > 0 ? (
                      <span className="font-medium text-red-700">{report.overdueCount}</span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

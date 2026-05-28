import { analyticsToCsv, downloadCsv } from '@/features/analytics/analytics.logic';
import { BarChart } from '@/features/analytics/BarChart';
import { useAnalytics } from '@/features/analytics/useAnalytics';

export function AnalyticsPage() {
  const { data, loading, error } = useAnalytics();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading analytics…</p>;
  }

  if (!data) {
    return <p className="text-sm text-slate-600">Unable to load analytics.</p>;
  }

  const { metrics } = data;

  function handleExport() {
    downloadCsv('onboarding-analytics.csv', analyticsToCsv(data));
  }

  return (
    <section aria-labelledby="analytics-title" className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="analytics-title" className="text-2xl font-semibold text-slate-900">
            HR Analytics
          </h1>
          <p className="mt-1 text-slate-600">
            Organization-wide onboarding metrics and compliance reporting.
          </p>
          {error ? (
            <p className="mt-2 text-sm text-amber-700" role="status">
              Showing cached demo data ({error}).
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active onboarding" value={metrics.activeOnboarding} />
        <MetricCard label="Avg completion" value={`${metrics.avgCompletionPercent}%`} />
        <MetricCard label="Overdue tasks" value={metrics.overdueTasks} />
        <MetricCard label="Completed this month" value={metrics.completedThisMonth} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Progress by department</h2>
        <p className="mt-1 text-sm text-slate-600">Average onboarding completion per department.</p>
        <div className="mt-4">
          <BarChart data={data.byDepartment} valueKey="avgProgressPercent" label="Department progress" />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

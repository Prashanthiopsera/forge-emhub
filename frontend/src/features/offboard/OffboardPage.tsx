import { Link } from 'react-router-dom';
import { daysUntilPiiDeletion } from '@/features/offboard/offboard.logic';
import { useOffboard } from '@/features/offboard/useOffboard';

export function OffboardPage() {
  const { employees, loading, submitting, error, message, markOffboarded } = useOffboard();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading employees…</p>;
  }

  return (
    <section aria-labelledby="offboard-title" className="space-y-6">
      <header>
        <p className="text-sm text-slate-500">
          <Link to="/admin" className="text-brand-600 hover:underline">
            Admin
          </Link>
        </p>
        <h1 id="offboard-title" className="text-2xl font-semibold text-slate-900">
          Employee Offboarding
        </h1>
        <p className="mt-1 text-slate-600">
          Mark employees as offboarded to start the 90-day PII deletion window (WO-035).
        </p>
      </header>

      {message ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-amber-700" role="status">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {employees.map((employee) => (
          <li
            key={employee.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{employee.fullName}</p>
              <p className="text-sm text-slate-600">{employee.email}</p>
              {employee.offboardedAt ? (
                <p className="mt-1 text-xs text-slate-500">
                  Offboarded {employee.offboardedAt.slice(0, 10)} — PII deletion in{' '}
                  {daysUntilPiiDeletion(employee.offboardedAt)} days
                </p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={submitting || Boolean(employee.offboardedAt)}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              onClick={() => void markOffboarded(employee.id)}
            >
              {employee.offboardedAt ? 'Offboarded' : 'Mark offboarded'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

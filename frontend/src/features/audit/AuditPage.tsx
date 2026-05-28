import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterAuditEntries, uniqueTableNames } from '@/features/audit/audit.logic';
import type { AuditFilters } from '@/features/audit/audit.types';
import { useAuditLog } from '@/features/audit/useAuditLog';

const EMPTY_FILTERS: AuditFilters = {
  tableName: '',
  eventType: '',
  userId: '',
  fromDate: '',
  toDate: '',
};

export function AuditPage() {
  const { entries, loading, error, source } = useAuditLog();
  const [filters, setFilters] = useState<AuditFilters>(EMPTY_FILTERS);

  const filtered = useMemo(() => filterAuditEntries(entries, filters), [entries, filters]);
  const tables = useMemo(() => uniqueTableNames(entries), [entries]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading audit log…</p>;
  }

  return (
    <section aria-labelledby="audit-title" className="space-y-6">
      <header>
        <p className="text-sm text-slate-500">
          <Link to="/admin" className="text-brand-600 hover:underline">
            Admin
          </Link>
        </p>
        <h1 id="audit-title" className="text-2xl font-semibold text-slate-900">
          Audit Log
        </h1>
        <p className="mt-1 text-slate-600">
          Immutable record of data changes for compliance review (WO-034).
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            Showing demo data ({error}).
          </p>
        ) : null}
        {source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo audit entries.
          </p>
        ) : null}
      </header>

      <form
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filter audit log"
      >
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Table</span>
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={filters.tableName}
            onChange={(e) => setFilters({ ...filters, tableName: e.target.value })}
          >
            <option value="">All tables</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Action</span>
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={filters.eventType}
            onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
          >
            <option value="">All actions</option>
            <option value="insert">insert</option>
            <option value="update">update</option>
            <option value="delete">delete</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">User ID</span>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">From</span>
          <input
            type="date"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">To</span>
          <input
            type="date"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          />
        </label>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Audit log entries</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">
                Timestamp
              </th>
              <th scope="col" className="px-4 py-3">
                User
              </th>
              <th scope="col" className="px-4 py-3">
                Action
              </th>
              <th scope="col" className="px-4 py-3">
                Table
              </th>
              <th scope="col" className="px-4 py-3">
                Record
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-slate-600">
                  No audit entries match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 whitespace-nowrap">{entry.createdAt}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.actorUserId ?? '—'}</td>
                  <td className="px-4 py-3">{entry.eventType}</td>
                  <td className="px-4 py-3">{entry.tableName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.recordId ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

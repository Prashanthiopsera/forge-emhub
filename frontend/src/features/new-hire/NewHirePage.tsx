import { Link } from 'react-router-dom';
import { useNewHire } from '@/features/new-hire/useNewHire';

export function NewHirePage() {
  const {
    form,
    setForm,
    departments,
    managers,
    matchedTemplate,
    loading,
    submitting,
    error,
    created,
    source,
    submit,
  } = useNewHire();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading new hire form…</p>;
  }

  return (
    <section aria-labelledby="new-hire-title" className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm text-slate-500">
          <Link to="/admin" className="text-brand-600 hover:underline">
            Admin
          </Link>
        </p>
        <h1 id="new-hire-title" className="text-2xl font-semibold text-slate-900">
          Create New Hire
        </h1>
        <p className="mt-1 text-slate-600">
          Creates an auth user stub, profile, onboarding plan, and task progress from the matched
          template.
        </p>
        {source === 'fixture' ? (
          <p className="mt-2 text-sm text-slate-500">Demo mode — no Supabase records are written.</p>
        ) : null}
      </header>

      {created ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900" role="status">
          <p className="font-semibold">New hire created</p>
          <p className="mt-1">Template: {created.templateName}</p>
          <p>User ID: {created.userId}</p>
          <p>Plan ID: {created.planId}</p>
          <p>Tasks generated: {created.tasksCreated}</p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-amber-700" role="alert">
          {error}
        </p>
      ) : null}

      {matchedTemplate ? (
        <p className="text-sm text-slate-600">
          Matched template: <span className="font-medium">{matchedTemplate.name}</span>
        </p>
      ) : (
        <p className="text-sm text-amber-700">No template match for current role/department.</p>
      )}

      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Full name</span>
          <input
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Role</span>
          <select
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Department</span>
          <select
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Manager</span>
          <select
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.managerId}
            onChange={(e) => setForm({ ...form, managerId: e.target.value })}
          >
            <option value="">None</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Start date</span>
          <input
            required
            type="date"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Job title</span>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Photo URL</span>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !matchedTemplate}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create new hire'}
        </button>
      </form>
    </section>
  );
}

import { Link } from 'react-router-dom';

export function AdminPage() {
  return (
    <section aria-labelledby="admin-title" className="space-y-6">
      <header>
        <h1 id="admin-title" className="text-2xl font-semibold text-slate-900">
          Admin
        </h1>
        <p className="mt-1 text-slate-600">HR administrator tools and content management.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            to="/admin/new-hire"
            className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-slate-900">New Hire</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create employees and assign onboarding plans from templates.
            </p>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/training"
            className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-slate-900">Training Content</h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage video modules, quizzes, and Vimeo/Wistia embed URLs.
            </p>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/templates"
            className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-slate-900">Onboarding Templates</h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage checklist templates, tasks, and preview employee journeys.
            </p>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/faq"
            className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-slate-900">FAQ Editor</h2>
            <p className="mt-1 text-sm text-slate-600">Create and review knowledge base articles.</p>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/escalations"
            className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-slate-900">HR Escalations</h2>
            <p className="mt-1 text-sm text-slate-600">Respond to chatbot escalations from employees.</p>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/audit"
            className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-slate-900">Audit Log</h2>
            <p className="mt-1 text-sm text-slate-600">Review immutable change history for compliance.</p>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/offboard"
            className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-slate-900">Offboarding</h2>
            <p className="mt-1 text-sm text-slate-600">
              Mark employees offboarded and trigger the 90-day PII deletion workflow.
            </p>
          </Link>
        </li>
      </ul>
    </section>
  );
}

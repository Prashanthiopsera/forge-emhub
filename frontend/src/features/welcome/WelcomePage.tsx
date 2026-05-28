import { Link } from 'react-router-dom';

export function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4">
      <main className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Employee Onboarding Hub
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Welcome aboard</h1>
        <p className="mt-4 text-lg text-slate-600">
          Your centralized portal for onboarding tasks, training, team discovery, and support.
        </p>
        <p className="mt-6 rounded-lg bg-white px-4 py-3 text-sm text-brand-700 shadow-sm ring-1 ring-brand-100">
          Tailwind CSS is active — this badge uses{' '}
          <span className="font-mono font-semibold">text-brand-700</span> utility classes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-brand-600 px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Create account
          </Link>
        </div>
      </main>
    </div>
  );
}

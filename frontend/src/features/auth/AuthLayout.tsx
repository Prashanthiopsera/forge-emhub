import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-brand-600">
          Employee Onboarding Hub
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-2 text-center text-sm text-slate-600">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm">{footer}</div> : null}
      </div>
      <Link to="/" className="mt-6 text-sm text-slate-600 hover:text-brand-700">
        ← Back to home
      </Link>
    </div>
  );
}

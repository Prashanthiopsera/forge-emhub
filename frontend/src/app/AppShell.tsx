import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/checklist', label: 'Checklist' },
  { to: '/training', label: 'Training' },
  { to: '/org-chart', label: 'Org Chart' },
  { to: '/faq', label: 'FAQ' },
  { to: '/chatbot', label: 'Chatbot' },
  { to: '/admin', label: 'Admin' },
] as const;

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <nav
        className="w-56 shrink-0 border-r border-slate-200 bg-white p-4"
        aria-label="Main navigation"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Onboarding Hub
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Employee Onboarding Hub</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

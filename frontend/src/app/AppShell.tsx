import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { usePermissions } from '@/features/auth/usePermissions';
import { NotificationBell } from '@/features/notifications/NotificationBell';

export function AppShell() {
  const { user, role, signOut } = useAuth();
  const { navigationItems } = usePermissions();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

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
          {navigationItems.map((item) => (
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
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Employee Onboarding Hub</h1>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <NotificationBell />
            {role ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium uppercase text-slate-700">
                {role.replace('_', ' ')}
              </span>
            ) : null}
            <span className="hidden sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

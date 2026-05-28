import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { useAuth } from '@/features/auth/AuthContext';
import { mfaRedirectPath, resolveMfaStatus } from '@/features/auth/mfa/mfaStatus';
import { roleRequiresMfa } from '@/features/auth/mfa/requiresMfa';
import { useMfa } from '@/features/auth/mfa/useMfa';

export function MfaVerifyPage() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  const rateLimitKey = user?.id ?? user?.email ?? 'anonymous';
  const { loading, error, verifyLoginTotp, rateLimited, attemptsRemaining } = useMfa(rateLimitKey);

  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!roleRequiresMfa(role)) {
        navigate(from, { replace: true });
        return;
      }

      const status = await resolveMfaStatus(role);
      if (cancelled) return;

      const redirect = mfaRedirectPath(status);
      if (redirect && redirect !== '/mfa/verify') {
        navigate(redirect, { replace: true });
        return;
      }
      if (status === 'complete') {
        navigate(from, { replace: true });
        return;
      }

      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [role, navigate, from]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { error: verifyError } = await verifyLoginTotp(code);
    if (!verifyError) {
      navigate(from, { replace: true });
    }
  }

  if (checking) {
    return (
      <AuthLayout title="Verify authenticator" subtitle="Confirming MFA status…">
        <p className="text-center text-sm text-slate-600">Loading…</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify authenticator"
      subtitle="Enter the 6-digit code from your authenticator app to finish signing in."
      footer={
        <button
          type="button"
          onClick={() => void signOut().then(() => navigate('/login', { replace: true }))}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Sign out
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {rateLimited() ? (
          <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Too many failed attempts. Try again in 15 minutes.
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            {attemptsRemaining()} verification attempt(s) remaining in this window.
          </p>
        )}
        <div>
          <label htmlFor="mfa-verify-code" className="block text-sm font-medium text-slate-700">
            Authentication code
          </label>
          <input
            id="mfa-verify-code"
            name="mfa-verify-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={rateLimited()}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={loading || rateLimited() || code.length !== 6}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Verifying…' : 'Continue'}
        </button>
      </form>
    </AuthLayout>
  );
}

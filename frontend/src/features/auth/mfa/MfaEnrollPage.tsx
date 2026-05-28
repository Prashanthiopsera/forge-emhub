import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { useAuth } from '@/features/auth/AuthContext';
import { mfaRedirectPath, resolveMfaStatus } from '@/features/auth/mfa/mfaStatus';
import { totpQrImageSrc } from '@/features/auth/mfa/qrCode';
import { roleRequiresMfa } from '@/features/auth/mfa/requiresMfa';
import { useMfa } from '@/features/auth/mfa/useMfa';

export function MfaEnrollPage() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const rateLimitKey = user?.id ?? user?.email ?? 'anonymous';
  const { loading, error, startEnrollment, completeEnrollment, rateLimited, attemptsRemaining } =
    useMfa(rateLimitKey);

  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!roleRequiresMfa(role)) {
        navigate('/dashboard', { replace: true });
        return;
      }

      const status = await resolveMfaStatus(role);
      const redirect = mfaRedirectPath(status);
      if (redirect && redirect !== '/mfa/enroll') {
        navigate(redirect, { replace: true });
        return;
      }
      if (status === 'complete') {
        navigate('/dashboard', { replace: true });
        return;
      }

      const enroll = await startEnrollment();
      if (cancelled) return;
      if (enroll) {
        setFactorId(enroll.factorId);
        setQrCode(enroll.qrCode);
        setSecret(enroll.secret);
      }
      setBootstrapping(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [role, navigate, startEnrollment]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!factorId) return;

    const { error: verifyError } = await completeEnrollment(factorId, code);
    if (!verifyError) {
      navigate('/dashboard', { replace: true });
    }
  }

  if (bootstrapping) {
    return (
      <AuthLayout title="Set up authenticator" subtitle="Preparing your MFA enrollment…">
        <p className="text-center text-sm text-slate-600">Loading…</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set up authenticator"
      subtitle="HR administrators must enroll MFA. Scan the QR code with your authenticator app, then enter the 6-digit code."
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
      {qrCode ? (
        <div className="flex flex-col items-center gap-3">
          <img
            src={totpQrImageSrc(qrCode)}
            alt="TOTP QR code for authenticator app"
            className="h-48 w-48 rounded-lg border border-slate-200 bg-white p-2"
          />
          {secret ? (
            <p className="text-center text-xs text-slate-500">
              Manual entry secret: <span className="font-mono text-slate-700">{secret}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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
          <label htmlFor="mfa-code" className="block text-sm font-medium text-slate-700">
            Verification code
          </label>
          <input
            id="mfa-code"
            name="mfa-code"
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
          {loading ? 'Verifying…' : 'Enable MFA'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-500">
        Dev seed without MFA: <span className="font-mono">hr.programs@emhub.local</span>
      </p>
    </AuthLayout>
  );
}

import { useCallback, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  clearMfaRateLimit,
  isMfaRateLimited,
  mfaAttemptsRemaining,
  recordMfaFailedAttempt,
} from '@/features/auth/mfa/rateLimit';
import { resolveMfaStatus, type MfaStatus } from '@/features/auth/mfa/mfaStatus';
import type { AppRole } from '@/types/database.types';

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(typeof err === 'string' ? err : 'MFA operation failed');
}

export interface MfaEnrollState {
  factorId: string;
  qrCode: string;
  secret: string;
}

export function useMfa(rateLimitKey: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = useCallback(async (role: AppRole | null): Promise<MfaStatus> => {
    return resolveMfaStatus(role);
  }, []);

  const startEnrollment = useCallback(async (): Promise<MfaEnrollState | null> => {
    setLoading(true);
    setError(null);
    const { data, error: enrollError } = await getSupabase().auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator app',
    });
    setLoading(false);
    if (enrollError) {
      setError(enrollError.message);
      return null;
    }
    if (!data?.totp) {
      setError('Enrollment did not return TOTP details');
      return null;
    }
    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    };
  }, []);

  const completeEnrollment = useCallback(
    async (factorId: string, code: string): Promise<{ error: Error | null }> => {
      setLoading(true);
      setError(null);

      if (isMfaRateLimited(rateLimitKey)) {
        setLoading(false);
        const msg = 'Too many failed attempts. Try again in 15 minutes.';
        setError(msg);
        return { error: new Error(msg) };
      }

      const { data: challenge, error: challengeError } = await getSupabase().auth.mfa.challenge({
        factorId,
      });
      if (challengeError) {
        setLoading(false);
        setError(challengeError.message);
        recordMfaFailedAttempt(rateLimitKey);
        return { error: toError(challengeError) };
      }

      const { error: verifyError } = await getSupabase().auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      setLoading(false);

      if (verifyError) {
        setError(verifyError.message);
        recordMfaFailedAttempt(rateLimitKey);
        return { error: toError(verifyError) };
      }

      clearMfaRateLimit(rateLimitKey);
      return { error: null };
    },
    [rateLimitKey],
  );

  const verifyLoginTotp = useCallback(
    async (code: string): Promise<{ error: Error | null }> => {
      setLoading(true);
      setError(null);

      if (isMfaRateLimited(rateLimitKey)) {
        setLoading(false);
        const msg = 'Too many failed attempts. Try again in 15 minutes.';
        setError(msg);
        return { error: new Error(msg) };
      }

      const { data: factors, error: listError } = await getSupabase().auth.mfa.listFactors();
      if (listError) {
        setLoading(false);
        setError(listError.message);
        return { error: toError(listError) };
      }

      const totpFactor = factors.totp.find((f) => f.status === 'verified') ?? factors.totp[0];
      if (!totpFactor) {
        setLoading(false);
        const msg = 'No authenticator enrolled. Set up MFA first.';
        setError(msg);
        return { error: new Error(msg) };
      }

      const { data: challenge, error: challengeError } = await getSupabase().auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) {
        setLoading(false);
        setError(challengeError.message);
        recordMfaFailedAttempt(rateLimitKey);
        return { error: toError(challengeError) };
      }

      const { error: verifyError } = await getSupabase().auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code: code.trim(),
      });
      setLoading(false);

      if (verifyError) {
        setError(verifyError.message);
        recordMfaFailedAttempt(rateLimitKey);
        return { error: toError(verifyError) };
      }

      clearMfaRateLimit(rateLimitKey);
      return { error: null };
    },
    [rateLimitKey],
  );

  const attemptsRemaining = useCallback(() => mfaAttemptsRemaining(rateLimitKey), [rateLimitKey]);

  const rateLimited = useCallback(() => isMfaRateLimited(rateLimitKey), [rateLimitKey]);

  return {
    loading,
    error,
    setError,
    getStatus,
    startEnrollment,
    completeEnrollment,
    verifyLoginTotp,
    attemptsRemaining,
    rateLimited,
  };
}

import { getSupabase } from '@/lib/supabase';
import type { AppRole } from '@/types/database.types';
import { roleRequiresMfa } from '@/features/auth/mfa/requiresMfa';

export type MfaStatus =
  | 'not_required'
  | 'enrollment_required'
  | 'verification_required'
  | 'complete';

/** Resolves MFA step for the current session (WO-010). */
export async function resolveMfaStatus(role: AppRole | null): Promise<MfaStatus> {
  if (!roleRequiresMfa(role)) {
    return 'not_required';
  }

  const { data: factors, error: factorsError } = await getSupabase().auth.mfa.listFactors();
  if (factorsError) {
    throw factorsError;
  }

  const hasVerifiedTotp = factors.totp.some((factor) => factor.status === 'verified');
  if (!hasVerifiedTotp) {
    return 'enrollment_required';
  }

  const { data: aal, error: aalError } =
    await getSupabase().auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalError) {
    throw aalError;
  }

  if (aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
    return 'verification_required';
  }

  return 'complete';
}

export function mfaRedirectPath(status: MfaStatus): string | null {
  if (status === 'enrollment_required') return '/mfa/enroll';
  if (status === 'verification_required') return '/mfa/verify';
  return null;
}

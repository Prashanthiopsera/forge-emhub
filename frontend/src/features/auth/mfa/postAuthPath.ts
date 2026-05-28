import { mfaRedirectPath, resolveMfaStatus } from '@/features/auth/mfa/mfaStatus';
import type { AppRole } from '@/types/database.types';

/** Destination after password sign-in (MFA-aware for HR Admin). */
export async function resolvePostAuthPath(
  role: AppRole | null,
  fallback = '/dashboard',
): Promise<string> {
  const mfaPath = mfaRedirectPath(await resolveMfaStatus(role));
  return mfaPath ?? fallback;
}

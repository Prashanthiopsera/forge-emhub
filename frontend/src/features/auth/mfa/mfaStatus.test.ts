import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mfaRedirectPath, resolveMfaStatus } from './mfaStatus';

const mockListFactors = vi.fn();
const mockGetAal = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      mfa: {
        listFactors: mockListFactors,
        getAuthenticatorAssuranceLevel: mockGetAal,
      },
    },
  }),
}));

describe('resolveMfaStatus (WO-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns not_required for non HR Admin roles', async () => {
    expect(await resolveMfaStatus('employee')).toBe('not_required');
    expect(await resolveMfaStatus('manager')).toBe('not_required');
    expect(mockListFactors).not.toHaveBeenCalled();
  });

  it('returns enrollment_required when HR Admin has no verified TOTP', async () => {
    mockListFactors.mockResolvedValue({
      data: { totp: [{ id: 'f1', status: 'unverified' }], phone: [] },
      error: null,
    });

    expect(await resolveMfaStatus('hr_admin')).toBe('enrollment_required');
    expect(mfaRedirectPath('enrollment_required')).toBe('/mfa/enroll');
  });

  it('returns verification_required when factor exists but session is aal1', async () => {
    mockListFactors.mockResolvedValue({
      data: { totp: [{ id: 'f1', status: 'verified' }], phone: [] },
      error: null,
    });
    mockGetAal.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });

    expect(await resolveMfaStatus('hr_admin')).toBe('verification_required');
    expect(mfaRedirectPath('verification_required')).toBe('/mfa/verify');
  });

  it('returns complete when HR Admin session is at aal2', async () => {
    mockListFactors.mockResolvedValue({
      data: { totp: [{ id: 'f1', status: 'verified' }], phone: [] },
      error: null,
    });
    mockGetAal.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    });

    expect(await resolveMfaStatus('hr_admin')).toBe('complete');
    expect(mfaRedirectPath('complete')).toBeNull();
  });
});

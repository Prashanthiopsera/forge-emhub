import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearMfaRateLimit } from './rateLimit';
import { useMfa } from './useMfa';

const mockEnroll = vi.fn();
const mockChallenge = vi.fn();
const mockVerify = vi.fn();
const mockListFactors = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      mfa: {
        enroll: mockEnroll,
        challenge: mockChallenge,
        verify: mockVerify,
        listFactors: mockListFactors,
      },
    },
  }),
}));

describe('useMfa (WO-010)', () => {
  const key = 'hr-user';

  beforeEach(() => {
    vi.clearAllMocks();
    clearMfaRateLimit(key);
  });

  it('starts TOTP enrollment and returns QR payload', async () => {
    mockEnroll.mockResolvedValue({
      data: {
        id: 'factor-1',
        totp: { qr_code: '<svg></svg>', secret: 'SECRET123' },
      },
      error: null,
    });

    const { result } = renderHook(() => useMfa(key));

    let enroll: Awaited<ReturnType<typeof result.current.startEnrollment>> = null;
    await act(async () => {
      enroll = await result.current.startEnrollment();
    });

    expect(mockEnroll).toHaveBeenCalledWith({
      factorType: 'totp',
      friendlyName: 'Authenticator app',
    });
    expect(enroll).toEqual({
      factorId: 'factor-1',
      qrCode: '<svg></svg>',
      secret: 'SECRET123',
    });
  });

  it('completes enrollment via challenge and verify', async () => {
    mockChallenge.mockResolvedValue({ data: { id: 'challenge-1' }, error: null });
    mockVerify.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useMfa(key));

    let verifyResult: { error: Error | null } = { error: new Error('pending') };
    await act(async () => {
      verifyResult = await result.current.completeEnrollment('factor-1', '123456');
    });

    expect(mockChallenge).toHaveBeenCalledWith({ factorId: 'factor-1' });
    expect(mockVerify).toHaveBeenCalledWith({
      factorId: 'factor-1',
      challengeId: 'challenge-1',
      code: '123456',
    });
    expect(verifyResult.error).toBeNull();
  });

  it('verifies login TOTP using the first verified factor', async () => {
    mockListFactors.mockResolvedValue({
      data: { totp: [{ id: 'factor-2', status: 'verified' }], phone: [] },
      error: null,
    });
    mockChallenge.mockResolvedValue({ data: { id: 'challenge-2' }, error: null });
    mockVerify.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useMfa(key));

    await act(async () => {
      const { error } = await result.current.verifyLoginTotp('654321');
      expect(error).toBeNull();
    });

    expect(mockListFactors).toHaveBeenCalled();
    expect(mockVerify).toHaveBeenCalledWith({
      factorId: 'factor-2',
      challengeId: 'challenge-2',
      code: '654321',
    });
  });

  it('rate-limits repeated failed verifications', async () => {
    mockListFactors.mockResolvedValue({
      data: { totp: [{ id: 'factor-2', status: 'verified' }], phone: [] },
      error: null,
    });
    mockChallenge.mockResolvedValue({ data: { id: 'c' }, error: null });
    mockVerify.mockResolvedValue({ data: null, error: { message: 'Invalid code' } });

    const { result } = renderHook(() => useMfa(key));

    for (let i = 0; i < 5; i += 1) {
      await act(async () => {
        await result.current.verifyLoginTotp('000000');
      });
    }

    await act(async () => {
      const { error } = await result.current.verifyLoginTotp('000000');
      expect(error?.message).toMatch(/Too many failed attempts/);
    });

    await waitFor(() => expect(result.current.rateLimited()).toBe(true));
    expect(mockVerify).toHaveBeenCalledTimes(5);
  });
});

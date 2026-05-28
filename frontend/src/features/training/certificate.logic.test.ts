import { describe, expect, it } from 'vitest';
import { TRAINING_MODULE_FIXTURES } from '@/features/training/training.fixtures';
import {
  buildCertificateData,
  generateVerificationCode,
  isEligibleForCertificate,
  renderCertificatePdfStub,
  verifyCertificateCode,
} from '@/features/training/certificate.logic';
import { mergeModuleProgress } from '@/features/training/training.logic';

describe('certificate.logic (WO-019)', () => {
  it('generates deterministic verification codes', () => {
    const a = generateVerificationCode('mod-1', 'user-1');
    const b = generateVerificationCode('mod-1', 'user-1');
    expect(a).toBe(b);
    expect(a).toMatch(/^EMHUB-[0-9A-F]{8}$/);
  });

  it('validates verification code format', () => {
    expect(verifyCertificateCode('EMHUB-12345678').valid).toBe(true);
    expect(verifyCertificateCode('bad').valid).toBe(false);
  });

  it('requires video completion and quiz pass when applicable', () => {
    const modules = mergeModuleProgress(TRAINING_MODULE_FIXTURES, [
      { moduleId: 'm1000000-0000-4000-8000-000000000001', watchedSeconds: 600, completed: true },
      { moduleId: 'm1000000-0000-4000-8000-000000000002', watchedSeconds: 480, completed: true },
    ]);
    const culture = modules.find((m) => m.id.endsWith('000001'))!;
    const security = modules.find((m) => m.id.endsWith('000002'))!;
    expect(isEligibleForCertificate(culture, null)).toBe(true);
    expect(isEligibleForCertificate(security, false)).toBe(false);
    expect(isEligibleForCertificate(security, true)).toBe(true);
  });

  it('builds certificate data and PDF stub bytes', () => {
    const module = mergeModuleProgress(TRAINING_MODULE_FIXTURES, [
      { moduleId: 'm1000000-0000-4000-8000-000000000001', watchedSeconds: 600, completed: true },
    ])[0];
    const data = buildCertificateData(module, 'Alex Chen', 'user-1', '2026-05-27', 100);
    expect(data.moduleTitle).toBe(module.title);
    const pdf = renderCertificatePdfStub(data);
    const text = new TextDecoder().decode(pdf);
    expect(text).toContain('%PDF');
    expect(text).toContain(data.verificationCode);
  });
});

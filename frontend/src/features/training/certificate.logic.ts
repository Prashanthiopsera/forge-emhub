import type { CatalogModule } from '@/features/training/training.types';

export type CertificateData = {
  employeeName: string;
  moduleTitle: string;
  completedAt: string;
  scorePercent: number | null;
  verificationCode: string;
};

/** Modules with quizzes require a passing score before certificate issuance (WO-019). */
const MODULES_WITH_QUIZ = new Set(['e1000000-0000-4000-8000-000000000002']);

export function isEligibleForCertificate(
  module: CatalogModule,
  quizPassed: boolean | null,
): boolean {
  if (!module.completed) return false;
  if (MODULES_WITH_QUIZ.has(module.id)) return quizPassed === true;
  return true;
}

/** Deterministic verification code from module + employee identifiers (WO-019 stub). */
export function generateVerificationCode(moduleId: string, employeeId: string): string {
  const raw = `${moduleId}:${employeeId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
  return `EMHUB-${hex.toUpperCase()}`;
}

export function buildCertificateData(
  module: CatalogModule,
  employeeName: string,
  employeeId: string,
  completedAt: string,
  scorePercent: number | null = null,
): CertificateData {
  return {
    employeeName,
    moduleTitle: module.title,
    completedAt,
    scorePercent,
    verificationCode: generateVerificationCode(module.id, employeeId),
  };
}

/** Minimal PDF bytes stub (%PDF header + certificate text) for download (WO-019). */
export function renderCertificatePdfStub(data: CertificateData): Uint8Array {
  const lines = [
    'Employee Onboarding Hub — Training Completion Certificate',
    '',
    `Employee: ${data.employeeName}`,
    `Training: ${data.moduleTitle}`,
    `Completed: ${data.completedAt}`,
    data.scorePercent !== null ? `Score: ${data.scorePercent}%` : '',
    `Verification: ${data.verificationCode}`,
    '',
    'This is a stub PDF for development. Production uses Supabase Storage.',
  ].filter(Boolean);

  const body = lines.join('\n');
  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj
4 0 obj<< /Length ${body.length + 20} >>stream
BT /F1 12 Tf 72 720 Td (${body.replace(/\n/g, ') Tj T* (')}) Tj ET
endstream endobj
xref
0 5
trailer<< /Root 1 0 R /Size 5 >>
startxref
0
%%EOF`;
  return new TextEncoder().encode(pdf);
}

export function verifyCertificateCode(code: string): { valid: boolean; reason?: string } {
  if (!/^EMHUB-[0-9A-F]{8}$/.test(code)) {
    return { valid: false, reason: 'Invalid format' };
  }
  return { valid: true };
}

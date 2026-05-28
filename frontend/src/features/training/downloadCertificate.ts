import {
  buildCertificateData,
  renderCertificatePdfStub,
  type CertificateData,
} from '@/features/training/certificate.logic';
import type { CatalogModule } from '@/features/training/training.types';

export function downloadCertificatePdf(data: CertificateData): void {
  const bytes = renderCertificatePdfStub(data);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `certificate-${data.verificationCode}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadModuleCertificate(
  module: CatalogModule,
  employeeName: string,
  employeeId: string,
  scorePercent: number | null = null,
): void {
  const data = buildCertificateData(
    module,
    employeeName,
    employeeId,
    new Date().toISOString().slice(0, 10),
    scorePercent,
  );
  downloadCertificatePdf(data);
}

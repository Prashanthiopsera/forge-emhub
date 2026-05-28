/** Build an img src for Supabase TOTP QR SVG payload. */
export function totpQrImageSrc(qrCode: string): string {
  if (qrCode.startsWith('data:')) {
    return qrCode;
  }
  const encoded = encodeURIComponent(qrCode);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

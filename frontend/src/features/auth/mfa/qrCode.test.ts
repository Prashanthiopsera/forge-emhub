import { describe, expect, it } from 'vitest';
import { totpQrImageSrc } from './qrCode';

describe('totpQrImageSrc', () => {
  it('passes through existing data URLs', () => {
    const dataUrl = 'data:image/svg+xml;base64,abc';
    expect(totpQrImageSrc(dataUrl)).toBe(dataUrl);
  });

  it('encodes raw SVG for img src', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(totpQrImageSrc(svg)).toContain('data:image/svg+xml');
    expect(totpQrImageSrc(svg)).toContain(encodeURIComponent('<svg'));
  });
});

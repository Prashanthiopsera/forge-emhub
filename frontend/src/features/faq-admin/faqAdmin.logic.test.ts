import { describe, expect, it } from 'vitest';
import {
  FAQ_STALE_DAYS,
  isArticleStale,
  staleWarningMessage,
} from '@/features/faq-admin/faqAdmin.logic';

describe('faqAdmin.logic (WO-025)', () => {
  it('flags articles not reviewed in 90 days as stale', () => {
    const old = new Date();
    old.setDate(old.getDate() - (FAQ_STALE_DAYS + 1));
    expect(isArticleStale(old.toISOString())).toBe(true);
  });

  it('does not flag recently reviewed articles', () => {
    expect(isArticleStale(new Date().toISOString())).toBe(false);
  });

  it('warns when never reviewed', () => {
    expect(staleWarningMessage(null)).toMatch(/never been reviewed/i);
  });

  it('warns when reviewed over 90 days ago', () => {
    const old = new Date();
    old.setDate(old.getDate() - 100);
    expect(staleWarningMessage(old.toISOString())).toMatch(/90 days/i);
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FAQ_FIXTURE_ARTICLES } from '@/features/faq/faq.fixtures';
import { fetchFaqFromSupabase, useFaqSearch } from '@/features/faq/useFaqSearch';

const mockCategoriesOrder = vi.fn();
const mockArticlesEq = vi.fn();
const mockArticlesTextSearch = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    from: (table: string) => {
      if (table === 'faq_categories') {
        return {
          select: () => ({
            eq: () => ({
              order: mockCategoriesOrder,
            }),
          }),
        };
      }

      if (table === 'faq_articles') {
        const chain = {
          select: () => chain,
          eq: () => chain,
          order: () => chain,
          textSearch: () => ({
            then: (
              onFulfilled: (value: unknown) => unknown,
              onRejected?: (reason: unknown) => unknown,
            ) => mockArticlesTextSearch().then(onFulfilled, onRejected),
          }),
          then: (
            onFulfilled: (value: unknown) => unknown,
            onRejected?: (reason: unknown) => unknown,
          ) => mockArticlesEq().then(onFulfilled, onRejected),
        };
        return chain;
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  }),
}));

describe('useFaqSearch (WO-024)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoriesOrder.mockResolvedValue({
      data: [
        { id: 'f1', name: 'Benefits', slug: 'benefits' },
        { id: 'f2', name: 'IT Setup', slug: 'it-setup' },
      ],
      error: null,
    });
    mockArticlesEq.mockResolvedValue({
      data: [
        {
          id: 'a1',
          category_id: 'f1',
          title: 'When does benefits enrollment start?',
          body: 'Enrollment opens on your start date.',
          reviewed_at: '2026-05-01T00:00:00Z',
          faq_categories: { id: 'f1', name: 'Benefits', slug: 'benefits' },
        },
      ],
      error: null,
    });
    mockArticlesTextSearch.mockResolvedValue({
      data: [
        {
          id: 'a2',
          category_id: 'f2',
          title: 'How do I request laptop provisioning?',
          body: 'Submit a ticket via the IT portal.',
          reviewed_at: '2026-05-01T00:00:00Z',
          faq_categories: { id: 'f2', name: 'IT Setup', slug: 'it-setup' },
        },
      ],
      error: null,
    });
  });

  it('falls back to fixture data when Supabase returns no rows', async () => {
    mockCategoriesOrder.mockResolvedValue({ data: null, error: { message: 'offline' } });
    mockArticlesEq.mockResolvedValue({ data: null, error: { message: 'offline' } });

    const { result } = renderHook(() => useFaqSearch());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.source).toBe('fixture');
    expect(result.current.data?.articles.length).toBeGreaterThanOrEqual(20);
  });

  it('maps Supabase rows into FAQ data', async () => {
    const remote = await fetchFaqFromSupabase('');
    expect(remote?.source).toBe('supabase');
    expect(remote?.articles[0]?.categoryName).toBe('Benefits');
    expect(mockArticlesEq).toHaveBeenCalled();
  });

  it('uses textSearch when query is provided', async () => {
    const remote = await fetchFaqFromSupabase('laptop');
    expect(remote?.articles[0]?.title).toMatch(/laptop/i);
    expect(mockArticlesTextSearch).toHaveBeenCalled();
  });

  it('fixture contains 22 articles for demo search', () => {
    expect(FAQ_FIXTURE_ARTICLES.length).toBe(22);
  });
});

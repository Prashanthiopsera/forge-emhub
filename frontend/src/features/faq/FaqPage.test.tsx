import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { buildFaqFixture } from '@/features/faq/faq.fixtures';
import { FaqPage } from '@/features/faq/FaqPage';

vi.mock('@/features/faq/useFaqSearch', () => ({
  useFaqSearch: vi.fn(),
}));

import { useFaqSearch } from '@/features/faq/useFaqSearch';

const mockUseFaqSearch = vi.mocked(useFaqSearch);

describe('FaqPage (WO-024)', () => {
  it('renders search, categories, and opens article detail', () => {
    const fixture = buildFaqFixture();
    mockUseFaqSearch.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      data: fixture,
      loading: false,
      error: null,
      debouncedQuery: '',
    });

    render(
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search FAQ')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Benefits' })).toBeInTheDocument();
    expect(screen.getByText('22 articles found')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /When does benefits enrollment start\?/i }),
    );

    expect(screen.getByRole('heading', { name: 'When does benefits enrollment start?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Back to results' })).toBeInTheDocument();
  });

  it('shows loading state while FAQ data is fetched', () => {
    mockUseFaqSearch.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      data: null,
      loading: true,
      error: null,
      debouncedQuery: '',
    });

    render(
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading FAQ…')).toBeInTheDocument();
  });
});

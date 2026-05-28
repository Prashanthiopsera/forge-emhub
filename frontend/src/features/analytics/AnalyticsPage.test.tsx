import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildAnalyticsFixture } from '@/features/analytics/analytics.fixtures';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';

vi.mock('@/features/analytics/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}));

import { useAnalytics } from '@/features/analytics/useAnalytics';

const mockUseAnalytics = vi.mocked(useAnalytics);

describe('AnalyticsPage (WO-027)', () => {
  it('renders metrics, chart, and export button', () => {
    mockUseAnalytics.mockReturnValue({
      data: buildAnalyticsFixture(),
      loading: false,
      error: null,
    });

    render(<AnalyticsPage />);

    expect(screen.getByRole('heading', { name: 'HR Analytics' })).toBeInTheDocument();
    expect(screen.getByText('Active onboarding')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
    expect(screen.getByLabelText('Department progress')).toBeInTheDocument();
  });
});

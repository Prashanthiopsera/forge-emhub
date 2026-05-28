import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { buildDashboardFixture } from '@/features/dashboard/dashboard.fixtures';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

vi.mock('@/features/dashboard/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));

import { useDashboardData } from '@/features/dashboard/useDashboardData';

const mockUseDashboardData = vi.mocked(useDashboardData);

describe('DashboardPage (WO-011)', () => {
  it('renders welcome card, timeline, progress, and next actions', () => {
    mockUseDashboardData.mockReturnValue({
      data: buildDashboardFixture(),
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Alex Chen' })).toBeInTheDocument();
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Onboarding completion' })).toHaveAttribute(
      'aria-valuenow',
      '33',
    );
    expect(screen.getByText('Day1').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('link', { name: /Meet your manager/i })).toHaveAttribute(
      'href',
      '/checklist',
    );
    expect(screen.getByRole('link', { name: /Set up development environment/i })).toHaveAttribute(
      'href',
      '/checklist',
    );
  });

  it('shows loading state while data is fetched', () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading your dashboard…')).toBeInTheDocument();
  });
});

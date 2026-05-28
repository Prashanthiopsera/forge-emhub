import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from '@/test/a11y';
import { buildDashboardFixture } from '@/features/dashboard/dashboard.fixtures';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

vi.mock('@/features/dashboard/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));

import { useDashboardData } from '@/features/dashboard/useDashboardData';

const mockUseDashboardData = vi.mocked(useDashboardData);

describe('DashboardPage a11y (WO-036)', () => {
  it('has no serious accessibility violations', async () => {
    mockUseDashboardData.mockReturnValue({
      data: buildDashboardFixture(),
      loading: false,
      error: null,
    });

    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

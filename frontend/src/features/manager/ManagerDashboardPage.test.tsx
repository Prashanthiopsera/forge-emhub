import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { buildTeamProgressFixture } from '@/features/manager/manager.fixtures';
import { ManagerDashboardPage } from '@/features/manager/ManagerDashboardPage';

vi.mock('@/features/manager/useTeamProgress', () => ({
  useTeamProgress: vi.fn(),
}));

import { useTeamProgress } from '@/features/manager/useTeamProgress';

const mockUseTeamProgress = vi.mocked(useTeamProgress);

describe('ManagerDashboardPage (WO-026)', () => {
  it('renders direct report progress table', () => {
    mockUseTeamProgress.mockReturnValue({
      data: buildTeamProgressFixture(),
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <ManagerDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Team Progress' })).toBeInTheDocument();
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });
});

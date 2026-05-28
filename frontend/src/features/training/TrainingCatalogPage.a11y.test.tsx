import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from '@/test/a11y';
import { buildTrainingFixture } from '@/features/training/training.fixtures';
import { TrainingCatalogPage } from '@/features/training/TrainingCatalogPage';

vi.mock('@/features/training/useTrainingProgress', () => ({
  useTrainingProgress: vi.fn(),
}));

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'alex@emhub.local' } }),
}));

vi.mock('@/features/training/VideoPlayer', () => ({
  VideoPlayer: () => <div data-testid="video-player-stub">Video player</div>,
}));

import { useTrainingProgress } from '@/features/training/useTrainingProgress';

const mockUseTrainingProgress = vi.mocked(useTrainingProgress);

describe('TrainingCatalogPage a11y (WO-036)', () => {
  it('has no serious accessibility violations', async () => {
    mockUseTrainingProgress.mockReturnValue({
      data: buildTrainingFixture(),
      loading: false,
      error: null,
      saving: false,
      updateModuleProgress: vi.fn(),
      reload: undefined,
    });

    const { container } = render(
      <MemoryRouter>
        <TrainingCatalogPage />
      </MemoryRouter>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

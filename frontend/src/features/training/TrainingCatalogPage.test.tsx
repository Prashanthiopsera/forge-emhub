import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { buildTrainingFixture } from '@/features/training/training.fixtures';
import { TrainingCatalogPage } from '@/features/training/TrainingCatalogPage';

vi.mock('@/features/training/useTrainingProgress', () => ({
  useTrainingProgress: vi.fn(),
}));

import { useTrainingProgress } from '@/features/training/useTrainingProgress';

const mockUseTrainingProgress = vi.mocked(useTrainingProgress);

describe('TrainingCatalogPage (WO-016)', () => {
  it('renders catalog with category filter and completion status', () => {
    mockUseTrainingProgress.mockReturnValue({
      data: buildTrainingFixture(),
      loading: false,
      error: null,
      saving: false,
      updateModuleProgress: vi.fn(),
      reload: undefined,
    });

    render(
      <MemoryRouter>
        <TrainingCatalogPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Training' })).toBeInTheDocument();
    expect(screen.getAllByText('Welcome to Our Culture').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Secure Your Workspace').length).toBeGreaterThanOrEqual(1);
    const moduleList = screen.getByRole('list', { name: 'Training modules' });
    expect(moduleList).toHaveTextContent('Completed');
    expect(moduleList.textContent).toMatch(/In progress/);
    expect(screen.getByTitle('Training video: Welcome to Our Culture')).toBeInTheDocument();
  });

  it('filters modules when a category is selected', () => {
    mockUseTrainingProgress.mockReturnValue({
      data: buildTrainingFixture(),
      loading: false,
      error: null,
      saving: false,
      updateModuleProgress: vi.fn(),
      reload: undefined,
    });

    render(
      <MemoryRouter>
        <TrainingCatalogPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'IT Setup' }));

    const moduleList = screen.getByRole('list', { name: 'Training modules' });
    expect(moduleList).toHaveTextContent('Secure Your Workspace');
    expect(moduleList).not.toHaveTextContent('Welcome to Our Culture');
  });

  it('shows loading state while data is fetched', () => {
    mockUseTrainingProgress.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      saving: false,
      updateModuleProgress: vi.fn(),
      reload: undefined,
    });

    render(
      <MemoryRouter>
        <TrainingCatalogPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading training catalog…')).toBeInTheDocument();
  });
});

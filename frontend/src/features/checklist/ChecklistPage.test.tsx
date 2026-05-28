import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildChecklistFixture } from '@/features/checklist/checklist.fixtures';
import { ChecklistPage } from '@/features/checklist/ChecklistPage';

vi.mock('@/features/checklist/useChecklist', () => ({
  useChecklist: vi.fn(),
}));

import { useChecklist } from '@/features/checklist/useChecklist';

const mockUseChecklist = vi.mocked(useChecklist);

describe('ChecklistPage (WO-012)', () => {
  it('renders phase groups, progress bar, and tasks', () => {
    mockUseChecklist.mockReturnValue({
      data: buildChecklistFixture(),
      loading: false,
      error: null,
      completingId: null,
      markComplete: vi.fn(),
    });

    render(<ChecklistPage />);

    expect(screen.getByRole('heading', { name: 'Onboarding Checklist' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByRole('heading', { name: 'Phase Day1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Phase Week1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Phase Month1' })).toBeInTheDocument();
    expect(screen.getByText('Meet your manager')).toBeInTheDocument();
    expect(screen.getByText(/days overdue/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseChecklist.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      completingId: null,
      markComplete: vi.fn(),
    });

    render(<ChecklistPage />);
    expect(screen.getByText('Loading your checklist…')).toBeInTheDocument();
  });
});

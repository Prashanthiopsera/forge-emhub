import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from '@/test/a11y';
import { buildChecklistFixture } from '@/features/checklist/checklist.fixtures';
import { ChecklistPage } from '@/features/checklist/ChecklistPage';

vi.mock('@/features/checklist/useChecklist', () => ({
  useChecklist: vi.fn(),
}));

import { useChecklist } from '@/features/checklist/useChecklist';

const mockUseChecklist = vi.mocked(useChecklist);

describe('ChecklistPage a11y (WO-036)', () => {
  it('has no serious accessibility violations', async () => {
    mockUseChecklist.mockReturnValue({
      data: buildChecklistFixture(),
      loading: false,
      error: null,
      saving: false,
      updateTaskStatus: vi.fn(),
      reload: undefined,
    });

    const { container } = render(
      <MemoryRouter>
        <ChecklistPage />
      </MemoryRouter>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

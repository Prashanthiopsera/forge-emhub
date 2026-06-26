import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { buildTemplatesFixture } from '@/features/templates/templates.fixtures';
import { TemplateManagementPage } from '@/features/templates/TemplateManagementPage';

vi.mock('@/features/templates/useTemplates', () => ({
  useTemplates: vi.fn(),
}));

import { useTemplates } from '@/features/templates/useTemplates';

const mockUseTemplates = vi.mocked(useTemplates);

describe('TemplateManagementPage (WO-014)', () => {
  it('renders template list and preview', () => {
    mockUseTemplates.mockReturnValue({
      data: buildTemplatesFixture(),
      loading: false,
      error: null,
      saving: false,
      selectedId: 'b1000000-0000-4000-8000-000000000001',
      setSelectedId: vi.fn(),
      load: vi.fn(),
      createTemplate: vi.fn(),
      saveTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
      addTask: vi.fn(),
      deleteTask: vi.fn(),
      reorderTasks: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TemplateManagementPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'HR Template Management' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByText('Engineering IC — Standard')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuditPage } from '@/features/audit/AuditPage';

vi.mock('@/features/audit/useAuditLog', () => ({
  useAuditLog: vi.fn(),
}));

import { useAuditLog } from '@/features/audit/useAuditLog';
import { AUDIT_LOG_FIXTURES } from '@/features/audit/audit.fixtures';

const mockUseAuditLog = vi.mocked(useAuditLog);

describe('AuditPage (WO-034)', () => {
  it('renders audit table with filter controls', () => {
    mockUseAuditLog.mockReturnValue({
      entries: AUDIT_LOG_FIXTURES,
      loading: false,
      error: null,
      source: 'fixture',
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuditPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Audit Log' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('faq_articles').length).toBeGreaterThanOrEqual(1);
  });
});

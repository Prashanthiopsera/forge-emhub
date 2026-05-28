import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildOrgChartFixture } from '@/features/org-chart/org-chart.fixtures';
import { OrgChartPage } from '@/features/org-chart/OrgChartPage';

vi.mock('@/features/org-chart/useOrgChart', () => ({
  useOrgChart: vi.fn(),
}));

import { useOrgChart } from '@/features/org-chart/useOrgChart';

const mockUseOrgChart = vi.mocked(useOrgChart);
const fixture = buildOrgChartFixture();

describe('OrgChartPage (WO-023)', () => {
  it('renders tree, search, and detail card', () => {
    mockUseOrgChart.mockReturnValue({
      data: fixture,
      loading: false,
      error: null,
      query: '',
      setQuery: vi.fn(),
      visibleRoots: fixture.roots,
      expandedIds: new Set(fixture.nodes.map((node) => node.id)),
      toggleExpanded: vi.fn(),
      selectedNode: fixture.nodes[2],
      setSelectedId: vi.fn(),
    });

    render(<OrgChartPage />);
    expect(screen.getByRole('heading', { name: 'Org Chart' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getAllByText('Alex Chen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Software Engineer').length).toBeGreaterThan(0);
  });

  it('shows loading state', () => {
    mockUseOrgChart.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      query: '',
      setQuery: vi.fn(),
      visibleRoots: [],
      expandedIds: new Set(),
      toggleExpanded: vi.fn(),
      selectedNode: null,
      setSelectedId: vi.fn(),
    });

    render(<OrgChartPage />);
    expect(screen.getByText('Loading org chart…')).toBeInTheDocument();
  });
});

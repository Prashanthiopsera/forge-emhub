import { describe, expect, it } from 'vitest';
import { buildOrgChartFixture } from '@/features/org-chart/org-chart.fixtures';
import {
  buildOrgChartTree,
  collectExpandedNodeIds,
  filterOrgChartNodes,
} from '@/features/org-chart/org-chart.logic';

describe('org-chart.logic (WO-023)', () => {
  const { nodes } = buildOrgChartFixture();

  it('builds a tree with manager relationships', () => {
    const roots = buildOrgChartTree(nodes);
    expect(roots).toHaveLength(1);
    expect(roots[0].displayName).toBe('Maria Santos');
    expect(roots[0].children.some((child) => child.displayName === 'Morgan Blake')).toBe(true);
  });

  it('filters nodes by search query', () => {
    const filtered = filterOrgChartNodes(nodes, 'alex');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].displayName).toBe('Alex Chen');
  });

  it('collects ancestor ids for search matches', () => {
    const alex = nodes.find((node) => node.displayName === 'Alex Chen')!;
    const expanded = collectExpandedNodeIds(nodes, new Set([alex.id]));
    expect(expanded.has('o1000000-0000-4000-8000-000000000002')).toBe(true);
  });
});

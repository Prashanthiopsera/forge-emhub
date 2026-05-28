import type {
  OrgChartNode,
  OrgChartTreeNode,
  OrgDepartment,
} from '@/features/org-chart/org-chart.types';

export function buildOrgChartTree(nodes: OrgChartNode[]): OrgChartTreeNode[] {
  const byId = new Map<string, OrgChartTreeNode>();

  for (const node of nodes) {
    byId.set(node.id, { ...node, children: [] });
  }

  const roots: OrgChartTreeNode[] = [];

  for (const node of byId.values()) {
    if (node.managerNodeId && byId.has(node.managerNodeId)) {
      byId.get(node.managerNodeId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (treeNodes: OrgChartTreeNode[]): OrgChartTreeNode[] =>
    treeNodes
      .map((treeNode) => ({
        ...treeNode,
        children: sortTree(treeNode.children),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return sortTree(roots);
}

export function filterOrgChartNodes(nodes: OrgChartNode[], query: string): OrgChartNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return nodes;

  return nodes.filter((node) => {
    const haystack = [node.displayName, node.jobTitle, node.email, node.departmentName]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function collectExpandedNodeIds(
  nodes: OrgChartNode[],
  matchingIds: Set<string>,
): Set<string> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const expanded = new Set<string>();

  for (const id of matchingIds) {
    let current = byId.get(id);
    while (current?.managerNodeId) {
      expanded.add(current.managerNodeId);
      current = byId.get(current.managerNodeId);
    }
  }

  return expanded;
}

export function findDepartmentName(
  departments: OrgDepartment[],
  departmentId: string | null,
): string | null {
  if (!departmentId) return null;
  return departments.find((department) => department.id === departmentId)?.name ?? null;
}

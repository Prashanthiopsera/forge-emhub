import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildOrgChartFixture } from '@/features/org-chart/org-chart.fixtures';
import {
  buildOrgChartTree,
  collectExpandedNodeIds,
  filterOrgChartNodes,
  findDepartmentName,
} from '@/features/org-chart/org-chart.logic';
import type { OrgChartData, OrgChartNode } from '@/features/org-chart/org-chart.types';
import { getSupabase } from '@/lib/supabase';

interface DepartmentRow {
  id: string;
  name: string;
  parent_department_id: string | null;
}

interface OrgChartNodeRow {
  id: string;
  department_id: string | null;
  user_id: string | null;
  display_name: string;
  job_title: string | null;
  email: string | null;
  manager_node_id: string | null;
}

export async function fetchOrgChartFromSupabase(): Promise<OrgChartData | null> {
  const supabase = getSupabase();

  const [{ data: departmentRows, error: deptError }, { data: nodeRows, error: nodeError }] =
    await Promise.all([
      supabase.from('departments').select('id, name, parent_department_id').order('name'),
      supabase
        .from('org_chart_nodes')
        .select('id, department_id, user_id, display_name, job_title, email, manager_node_id')
        .order('display_name'),
    ]);

  if (deptError || nodeError || !departmentRows?.length || !nodeRows?.length) return null;

  const departments = (departmentRows as DepartmentRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    parentDepartmentId: row.parent_department_id,
  }));

  const nodes: OrgChartNode[] = (nodeRows as OrgChartNodeRow[]).map((row) => ({
    id: row.id,
    departmentId: row.department_id,
    departmentName: findDepartmentName(departments, row.department_id),
    userId: row.user_id,
    displayName: row.display_name,
    jobTitle: row.job_title,
    email: row.email,
    managerNodeId: row.manager_node_id,
  }));

  return {
    departments,
    nodes,
    roots: buildOrgChartTree(nodes),
    source: 'supabase',
  };
}

export function useOrgChart() {
  const [data, setData] = useState<OrgChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchOrgChartFromSupabase();
      if (remote) {
        setData(remote);
        setExpandedIds(new Set(remote.nodes.map((node) => node.id)));
        return;
      }
      const fixture = buildOrgChartFixture();
      setData(fixture);
      setExpandedIds(new Set(fixture.nodes.map((node) => node.id)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load org chart';
      setError(message);
      const fixture = buildOrgChartFixture();
      setData(fixture);
      setExpandedIds(new Set(fixture.nodes.map((node) => node.id)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    return filterOrgChartNodes(data.nodes, query);
  }, [data, query]);

  const visibleRoots = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data.roots;

    const matchingIds = new Set(filteredNodes.map((node) => node.id));
    const autoExpanded = collectExpandedNodeIds(data.nodes, matchingIds);
    const allowed = new Set([...matchingIds, ...autoExpanded]);

    const prune = (treeNodes: typeof data.roots): typeof data.roots =>
      treeNodes
        .map((node) => ({
          ...node,
          children: prune(node.children),
        }))
        .filter(
          (node) =>
            allowed.has(node.id) || node.children.length > 0 || matchingIds.has(node.id),
        );

    return prune(data.roots);
  }, [data, filteredNodes, query]);

  const selectedNode = useMemo(
    () => data?.nodes.find((node) => node.id === selectedId) ?? null,
    [data?.nodes, selectedId],
  );

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  return {
    data,
    loading,
    error,
    query,
    setQuery,
    visibleRoots,
    expandedIds,
    toggleExpanded,
    selectedNode,
    setSelectedId,
  };
}

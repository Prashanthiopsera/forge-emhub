import { buildOrgChartTree } from '@/features/org-chart/org-chart.logic';
import type { OrgChartData, OrgChartNode, OrgDepartment } from '@/features/org-chart/org-chart.types';

const departments: OrgDepartment[] = [
  { id: 'd1000000-0000-4000-8000-000000000001', name: 'Engineering', parentDepartmentId: null },
  { id: 'd1000000-0000-4000-8000-000000000002', name: 'People Operations', parentDepartmentId: null },
  { id: 'd1000000-0000-4000-8000-000000000003', name: 'Information Technology', parentDepartmentId: null },
];

const nodes: OrgChartNode[] = [
  {
    id: 'o1000000-0000-4000-8000-000000000001',
    departmentId: 'd1000000-0000-4000-8000-000000000002',
    departmentName: 'People Operations',
    userId: 'u1000000-0000-4000-8000-000000000020',
    displayName: 'Maria Santos',
    jobTitle: 'HR Director',
    email: 'hr.admin@emhub.local',
    managerNodeId: null,
  },
  {
    id: 'o1000000-0000-4000-8000-000000000002',
    departmentId: 'd1000000-0000-4000-8000-000000000001',
    departmentName: 'Engineering',
    userId: 'u1000000-0000-4000-8000-000000000010',
    displayName: 'Morgan Blake',
    jobTitle: 'Engineering Manager',
    email: 'mgr.engineering@emhub.local',
    managerNodeId: 'o1000000-0000-4000-8000-000000000001',
  },
  {
    id: 'o1000000-0000-4000-8000-000000000003',
    departmentId: 'd1000000-0000-4000-8000-000000000001',
    departmentName: 'Engineering',
    userId: 'u1000000-0000-4000-8000-000000000001',
    displayName: 'Alex Chen',
    jobTitle: 'Software Engineer',
    email: 'alex.newhire@emhub.local',
    managerNodeId: 'o1000000-0000-4000-8000-000000000002',
  },
  {
    id: 'o1000000-0000-4000-8000-000000000004',
    departmentId: 'd1000000-0000-4000-8000-000000000003',
    departmentName: 'Information Technology',
    userId: 'u1000000-0000-4000-8000-000000000030',
    displayName: 'Chris Ortiz',
    jobTitle: 'IT Operations Lead',
    email: 'it.ops@emhub.local',
    managerNodeId: 'o1000000-0000-4000-8000-000000000001',
  },
];

export function buildOrgChartFixture(): OrgChartData {
  return {
    departments,
    nodes,
    roots: buildOrgChartTree(nodes),
    source: 'fixture',
  };
}

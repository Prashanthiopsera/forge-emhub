export interface OrgDepartment {
  id: string;
  name: string;
  parentDepartmentId: string | null;
}

export interface OrgChartNode {
  id: string;
  departmentId: string | null;
  departmentName: string | null;
  userId: string | null;
  displayName: string;
  jobTitle: string | null;
  email: string | null;
  managerNodeId: string | null;
}

export interface OrgChartTreeNode extends OrgChartNode {
  children: OrgChartTreeNode[];
}

export interface OrgChartData {
  departments: OrgDepartment[];
  nodes: OrgChartNode[];
  roots: OrgChartTreeNode[];
  source: 'supabase' | 'fixture';
}

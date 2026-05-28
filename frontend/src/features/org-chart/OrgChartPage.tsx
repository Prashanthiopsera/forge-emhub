import { useOrgChart } from '@/features/org-chart/useOrgChart';
import type { OrgChartTreeNode } from '@/features/org-chart/org-chart.types';

interface TreeRowProps {
  node: OrgChartTreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

function TreeRow({ node, depth, expandedIds, selectedId, onToggle, onSelect }: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <li>
      <div
        className="flex items-center gap-2"
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="rounded border border-slate-300 px-1.5 text-xs text-slate-600 hover:bg-slate-50"
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${node.displayName}` : `Expand ${node.displayName}`}
          >
            {expanded ? '−' : '+'}
          </button>
        ) : (
          <span className="inline-block w-7" aria-hidden />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={[
            'flex-1 rounded-md px-3 py-2 text-left text-sm transition-colors',
            isSelected
              ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-200'
              : 'hover:bg-slate-50',
          ].join(' ')}
        >
          <span className="font-medium text-slate-900">{node.displayName}</span>
          {node.jobTitle ? (
            <span className="mt-0.5 block text-xs text-slate-500">{node.jobTitle}</span>
          ) : null}
        </button>
      </div>
      {hasChildren && expanded ? (
        <ul className="mt-1 space-y-1">
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function OrgChartPage() {
  const {
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
  } = useOrgChart();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading org chart…</p>;
  }

  return (
    <section aria-labelledby="org-chart-title" className="space-y-6">
      <header>
        <h1 id="org-chart-title" className="text-2xl font-semibold text-slate-900">
          Org Chart
        </h1>
        <p className="mt-1 text-slate-600">
          Explore team structure, reporting lines, and departments.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            Showing cached demo data ({error}).
          </p>
        ) : null}
        {data?.source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo org chart data.
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Search org chart</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, title, email, or department…"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <nav aria-label="Organization tree" className="rounded-xl border border-slate-200 bg-white p-4">
            {visibleRoots.length === 0 ? (
              <p className="text-sm text-slate-600">No people match your search.</p>
            ) : (
              <ul className="space-y-1">
                {visibleRoots.map((node) => (
                  <TreeRow
                    key={node.id}
                    node={node}
                    depth={0}
                    expandedIds={expandedIds}
                    selectedId={selectedNode?.id ?? null}
                    onToggle={toggleExpanded}
                    onSelect={setSelectedId}
                  />
                ))}
              </ul>
            )}
          </nav>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Details</h2>
          {selectedNode ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Name</dt>
                <dd className="text-slate-900">{selectedNode.displayName}</dd>
              </div>
              {selectedNode.jobTitle ? (
                <div>
                  <dt className="font-medium text-slate-500">Title</dt>
                  <dd className="text-slate-900">{selectedNode.jobTitle}</dd>
                </div>
              ) : null}
              {selectedNode.departmentName ? (
                <div>
                  <dt className="font-medium text-slate-500">Department</dt>
                  <dd className="text-slate-900">{selectedNode.departmentName}</dd>
                </div>
              ) : null}
              {selectedNode.email ? (
                <div>
                  <dt className="font-medium text-slate-500">Email</dt>
                  <dd>
                    <a href={`mailto:${selectedNode.email}`} className="text-brand-700 hover:underline">
                      {selectedNode.email}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Select a person to view their details.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

import type { DepartmentMetric } from '@/features/analytics/analytics.types';

interface BarChartProps {
  data: DepartmentMetric[];
  valueKey: 'avgProgressPercent' | 'employeeCount' | 'overdueCount';
  label: string;
}

export function BarChart({ data, valueKey, label }: BarChartProps) {
  const max = Math.max(...data.map((row) => row[valueKey]), 1);

  return (
    <div aria-label={label} className="space-y-3">
      {data.map((row) => {
        const value = row[valueKey];
        const widthPercent = Math.round((value / max) * 100);

        return (
          <div key={row.departmentName}>
            <div className="mb-1 flex justify-between text-xs text-slate-600">
              <span>{row.departmentName}</span>
              <span>{value}{valueKey === 'avgProgressPercent' ? '%' : ''}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${widthPercent}%` }}
                role="presentation"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import type { AuditFilters, AuditLogEntry } from '@/features/audit/audit.types';

export function formatAuditSummary(entry: AuditLogEntry): string {
  return `${entry.eventType} on ${entry.tableName}${entry.recordId ? ` (${entry.recordId.slice(0, 8)}…)` : ''}`;
}

export function filterAuditEntries(
  entries: AuditLogEntry[],
  filters: AuditFilters,
): AuditLogEntry[] {
  return entries.filter((entry) => {
    if (filters.tableName && entry.tableName !== filters.tableName) return false;
    if (filters.eventType && entry.eventType !== filters.eventType) return false;
    if (filters.userId && entry.actorUserId !== filters.userId) return false;
    if (filters.fromDate && entry.createdAt < filters.fromDate) return false;
    if (filters.toDate && entry.createdAt > `${filters.toDate}T23:59:59`) return false;
    return true;
  });
}

export function uniqueTableNames(entries: AuditLogEntry[]): string[] {
  return [...new Set(entries.map((e) => e.tableName))].sort();
}

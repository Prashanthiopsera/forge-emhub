import { describe, expect, it } from 'vitest';
import { AUDIT_LOG_FIXTURES } from '@/features/audit/audit.fixtures';
import { filterAuditEntries, uniqueTableNames } from '@/features/audit/audit.logic';

describe('audit.logic (WO-034)', () => {
  it('filters by table and event type', () => {
    const filtered = filterAuditEntries(AUDIT_LOG_FIXTURES, {
      tableName: 'faq_articles',
      eventType: '',
      userId: '',
      fromDate: '',
      toDate: '',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].tableName).toBe('faq_articles');
  });

  it('lists unique table names', () => {
    expect(uniqueTableNames(AUDIT_LOG_FIXTURES)).toContain('task_progress');
  });
});

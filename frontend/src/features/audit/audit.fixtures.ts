import type { AuditLogEntry } from '@/features/audit/audit.types';

export const AUDIT_LOG_FIXTURES: AuditLogEntry[] = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    actorUserId: 'a1000000-0000-4000-8000-000000000020',
    eventType: 'update',
    tableName: 'faq_articles',
    recordId: 'f1000000-0000-4000-8000-000000000001',
    createdAt: '2026-05-26T14:00:00Z',
    summary: 'update on faq_articles',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    actorUserId: 'a1000000-0000-4000-8000-000000000020',
    eventType: 'insert',
    tableName: 'onboarding_plans',
    recordId: 'a2000000-0000-4000-8000-000000000099',
    createdAt: '2026-05-25T09:30:00Z',
    summary: 'insert on onboarding_plans',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    actorUserId: 'a1000000-0000-4000-8000-000000000001',
    eventType: 'update',
    tableName: 'task_progress',
    recordId: 'b1000000-0000-4000-8000-000000000010',
    createdAt: '2026-05-24T16:45:00Z',
    summary: 'update on task_progress',
  },
];

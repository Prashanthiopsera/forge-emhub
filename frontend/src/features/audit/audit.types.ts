export type AuditLogEntry = {
  id: string;
  actorUserId: string | null;
  eventType: string;
  tableName: string;
  recordId: string | null;
  createdAt: string;
  summary: string;
};

export type AuditFilters = {
  tableName: string;
  eventType: string;
  userId: string;
  fromDate: string;
  toDate: string;
};

const RETENTION_DAYS = 90;

export function daysUntilPiiDeletion(offboardedAt: string, now = new Date()): number {
  const deadline = new Date(offboardedAt);
  deadline.setDate(deadline.getDate() + RETENTION_DAYS);
  const ms = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function isReadyForPiiDeletion(offboardedAt: string, now = new Date()): boolean {
  return daysUntilPiiDeletion(offboardedAt, now) === 0;
}

export type OffboardEmployee = {
  id: string;
  fullName: string;
  email: string;
  offboardedAt: string | null;
};

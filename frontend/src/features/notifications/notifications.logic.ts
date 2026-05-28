import type {
  InAppNotification,
  NotificationPayload,
  NotificationRow,
  NotificationStatus,
} from '@/features/notifications/notification.types';

export const IN_APP_CHANNEL = 'in_app';

export function isUnreadStatus(status: NotificationStatus): boolean {
  return status === 'pending' || status === 'sent';
}

function parsePayload(payload: NotificationRow['payload']): NotificationPayload {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as NotificationPayload;
  }
  return {};
}

export function mapNotificationRow(row: NotificationRow): InAppNotification {
  const payload = parsePayload(row.payload);

  return {
    id: row.id,
    title: payload.title?.trim() || 'Notification',
    body: payload.body?.trim() || '',
    type: payload.type?.trim() || null,
    link: payload.link?.trim() || null,
    status: row.status,
    createdAt: row.created_at,
    read: !isUnreadStatus(row.status),
  };
}

export function countUnread(notifications: InAppNotification[]): number {
  return notifications.filter((notification) => !notification.read).length;
}

export function formatNotificationTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

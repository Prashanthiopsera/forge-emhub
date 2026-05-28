import type { InAppNotification } from '@/features/notifications/notification.types';

export function isProvisioningTask(notification: InAppNotification): boolean {
  return notification.type === 'provisioning';
}

export function filterProvisioningTasks(notifications: InAppNotification[]): InAppNotification[] {
  return notifications.filter(isProvisioningTask);
}

export function sortProvisioningTasks(notifications: InAppNotification[]): InAppNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

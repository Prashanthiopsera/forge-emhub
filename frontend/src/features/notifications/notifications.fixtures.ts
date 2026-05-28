import { ALEX_USER_ID } from '@/features/dashboard/dashboard.fixtures';
import type { InAppNotification } from '@/features/notifications/notification.types';

export const HR_ADMIN_USER_ID = 'u1000000-0000-4000-8000-000000000020';
export const IT_OPS_USER_ID = 'u1000000-0000-4000-8000-000000000030';

const alexNotifications: InAppNotification[] = [
  {
    id: 'n1000000-0000-4000-8000-000000000001',
    title: 'Welcome to EmHub',
    body: 'Complete your Day 1 checklist to get started.',
    type: 'onboarding',
    link: '/dashboard',
    status: 'sent',
    createdAt: '2026-05-27T09:00:00.000Z',
    read: false,
  },
  {
    id: 'n1000000-0000-4000-8000-000000000002',
    title: 'Security training due',
    body: 'Finish security training before your first sprint.',
    type: 'task',
    link: '/dashboard',
    status: 'sent',
    createdAt: '2026-05-27T10:30:00.000Z',
    read: false,
  },
  {
    id: 'n1000000-0000-4000-8000-000000000003',
    title: 'Manager intro scheduled',
    body: 'Your manager meeting is on the calendar for tomorrow.',
    type: 'calendar',
    link: null,
    status: 'read',
    createdAt: '2026-05-26T14:00:00.000Z',
    read: true,
  },
];

const hrNotifications: InAppNotification[] = [
  {
    id: 'n1000000-0000-4000-8000-000000000010',
    title: 'New hire batch ready',
    body: '12 employees started onboarding plans this week.',
    type: 'hr',
    link: null,
    status: 'sent',
    createdAt: '2026-05-27T08:00:00.000Z',
    read: false,
  },
];

const itNotifications: InAppNotification[] = [
  {
    id: 'n1000000-0000-4000-8000-000000000020',
    title: 'Laptop provisioning queue',
    body: '3 devices are waiting for shipment confirmation.',
    type: 'provisioning',
    link: null,
    status: 'sent',
    createdAt: '2026-05-27T07:15:00.000Z',
    read: false,
  },
];

export function buildNotificationFixtures(userId: string): InAppNotification[] {
  if (userId === ALEX_USER_ID) return alexNotifications;
  if (userId === HR_ADMIN_USER_ID) return hrNotifications;
  if (userId === IT_OPS_USER_ID) return itNotifications;
  return [];
}

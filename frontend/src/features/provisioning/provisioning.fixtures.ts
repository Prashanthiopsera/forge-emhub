import type { InAppNotification } from '@/features/notifications/notification.types';

export const IT_OPS_FIXTURE_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'a3000000-0000-4000-8000-000000000020',
    title: 'Laptop provisioning queue',
    body: '3 devices are waiting for shipment confirmation.',
    type: 'provisioning',
    link: null,
    status: 'sent',
    createdAt: '2026-05-26T09:00:00.000Z',
    read: false,
  },
  {
    id: 'a3000000-0000-4000-8000-000000000021',
    title: 'VPN access for new hire',
    body: 'Create VPN profile for alex.newhire@emhub.local.',
    type: 'provisioning',
    link: null,
    status: 'pending',
    createdAt: '2026-05-27T08:30:00.000Z',
    read: false,
  },
  {
    id: 'a3000000-0000-4000-8000-000000000022',
    title: 'Software catalog request',
    body: 'Approve Slack and Figma licenses for batch 12.',
    type: 'provisioning',
    link: null,
    status: 'read',
    createdAt: '2026-05-20T14:00:00.000Z',
    read: true,
  },
];

import { describe, expect, it } from 'vitest';
import {
  countUnread,
  formatNotificationTime,
  isUnreadStatus,
  mapNotificationRow,
} from '@/features/notifications/notifications.logic';

describe('notifications.logic (WO-030)', () => {
  it('treats pending and sent as unread', () => {
    expect(isUnreadStatus('pending')).toBe(true);
    expect(isUnreadStatus('sent')).toBe(true);
    expect(isUnreadStatus('read')).toBe(false);
    expect(isUnreadStatus('failed')).toBe(false);
  });

  it('maps notification rows from payload', () => {
    const mapped = mapNotificationRow({
      id: 'n1',
      user_id: 'u1',
      channel: 'in_app',
      status: 'sent',
      payload: { title: 'Hello', body: 'World', type: 'task', link: '/dashboard' },
      created_at: '2026-05-27T12:00:00.000Z',
    });

    expect(mapped.title).toBe('Hello');
    expect(mapped.body).toBe('World');
    expect(mapped.read).toBe(false);
    expect(mapped.link).toBe('/dashboard');
  });

  it('counts unread notifications', () => {
    const unread = countUnread([
      {
        id: '1',
        title: 'A',
        body: '',
        type: null,
        link: null,
        status: 'sent',
        createdAt: '2026-05-27T12:00:00.000Z',
        read: false,
      },
      {
        id: '2',
        title: 'B',
        body: '',
        type: null,
        link: null,
        status: 'read',
        createdAt: '2026-05-27T11:00:00.000Z',
        read: true,
      },
    ]);

    expect(unread).toBe(1);
  });

  it('formats relative notification times', () => {
    const now = new Date('2026-05-27T12:30:00.000Z');
    expect(formatNotificationTime('2026-05-27T12:29:00.000Z', now)).toBe('1m ago');
    expect(formatNotificationTime('2026-05-27T10:00:00.000Z', now)).toBe('2h ago');
  });
});

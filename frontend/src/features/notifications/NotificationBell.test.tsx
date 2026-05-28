import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { NotificationBell } from '@/features/notifications/NotificationBell';

const mockUseNotifications = vi.fn();

vi.mock('@/features/notifications/useNotifications', () => ({
  useNotifications: () => mockUseNotifications(),
}));

describe('NotificationBell (WO-030)', () => {
  it('shows unread badge and opens the panel', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          title: 'Welcome',
          body: 'Get started',
          type: 'onboarding',
          link: '/dashboard',
          status: 'sent',
          createdAt: '2026-05-27T09:00:00.000Z',
          read: false,
        },
      ],
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: '1 unread notifications' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '1 unread notifications' }));
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark "Welcome" as read' })).toBeInTheDocument();
  });
});

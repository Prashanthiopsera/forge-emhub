import { Link } from 'react-router-dom';
import { formatNotificationTime } from '@/features/notifications/notifications.logic';
import type { InAppNotification } from '@/features/notifications/notification.types';

interface NotificationPanelProps {
  notifications: InAppNotification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationPanelProps) {
  const hasUnread = notifications.some((notification) => !notification.read);

  return (
    <div
      id="notification-panel"
      role="region"
      aria-label="Notifications"
      className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
        {hasUnread ? (
          <button
            type="button"
            onClick={() => void onMarkAllAsRead()}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">You are all caught up.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={[
                  'px-4 py-3',
                  notification.read ? 'bg-white' : 'bg-brand-50/60',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{notification.body}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                    {notification.link ? (
                      <Link
                        to={notification.link}
                        onClick={onClose}
                        className="mt-1 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        View details
                      </Link>
                    ) : null}
                  </div>
                  {!notification.read ? (
                    <button
                      type="button"
                      onClick={() => void onMarkAsRead(notification.id)}
                      className="shrink-0 rounded border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      aria-label={`Mark "${notification.title}" as read`}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

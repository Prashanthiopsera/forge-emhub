import type { Database } from '@/types/database.types';

export type NotificationStatus = Database['public']['Enums']['notification_status'];

export interface NotificationPayload {
  title?: string;
  body?: string;
  type?: string;
  link?: string;
}

export interface NotificationRow {
  id: string;
  user_id: string | null;
  channel: string;
  status: NotificationStatus;
  payload: NotificationPayload | Record<string, unknown>;
  created_at: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: string | null;
  link: string | null;
  status: NotificationStatus;
  createdAt: string;
  read: boolean;
}

export type NotificationSource = 'supabase' | 'fixture';

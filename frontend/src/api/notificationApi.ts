import api from './client';
import { NotificationItem } from '../types/notification';

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await api.put<NotificationItem>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};

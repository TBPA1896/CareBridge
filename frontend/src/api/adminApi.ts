import api from './client';
import { AuditLogItem, DashboardStats } from '../types/admin';
import { User } from '../types/auth';

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>('/admin/dashboard');
    return res.data;
  },

  getUsers: async (role?: string): Promise<User[]> => {
    const params = role ? `?role=${role}` : '';
    const res = await api.get<User[]>(`/admin/users${params}`);
    return res.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<User> => {
    const res = await api.put<User>(`/admin/users/${userId}/status?status=${status}`);
    return res.data;
  },

  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    const res = await api.get<AuditLogItem[]>('/admin/audit-logs');
    return res.data;
  },
};

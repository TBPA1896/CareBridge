import api from './client';
import { AuthResponse, UserProfileResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  register: async (userData: any): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', userData);
    return res.data;
  },

  getMe: async (): Promise<UserProfileResponse> => {
    const res = await api.get<UserProfileResponse>('/auth/me');
    return res.data;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const res = await api.post('/auth/change-password', passwords);
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
  },
};

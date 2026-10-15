import api from './client';
import { User, UserProfileResponse } from '../types/auth';

export const patientApi = {
  getMyProfile: async (): Promise<UserProfileResponse> => {
    const res = await api.get<UserProfileResponse>('/patients/me');
    return res.data;
  },

  updateMyProfile: async (profileData: any): Promise<UserProfileResponse> => {
    const res = await api.put<UserProfileResponse>('/patients/me', profileData);
    return res.data;
  },

  getPatientById: async (patientId: string): Promise<UserProfileResponse> => {
    const res = await api.get<UserProfileResponse>(`/patients/${patientId}`);
    return res.data;
  },

  getAllPatients: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/patients');
    return res.data;
  },
};

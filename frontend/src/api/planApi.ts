import api from './client';
import { RecoveryPlan } from '../types/plan';

export const planApi = {
  createPlan: async (data: any): Promise<RecoveryPlan> => {
    const res = await api.post<RecoveryPlan>('/recovery-plans', data);
    return res.data;
  },

  getPlan: async (id: string): Promise<RecoveryPlan> => {
    const res = await api.get<RecoveryPlan>(`/recovery-plans/${id}`);
    return res.data;
  },

  getPatientPlans: async (patientId: string): Promise<RecoveryPlan[]> => {
    const res = await api.get<RecoveryPlan[]>(`/recovery-plans/patient/${patientId}`);
    return res.data;
  },

  getAllPlans: async (): Promise<RecoveryPlan[]> => {
    const res = await api.get<RecoveryPlan[]>('/recovery-plans');
    return res.data;
  },

  activatePlan: async (id: string): Promise<RecoveryPlan> => {
    const res = await api.post<RecoveryPlan>(`/recovery-plans/${id}/activate`);
    return res.data;
  },
};

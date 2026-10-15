import api from './client';
import { DeviationAlert } from '../types/alert';

export const alertApi = {
  getAlerts: async (patientId?: string): Promise<DeviationAlert[]> => {
    const params = patientId ? `?patientId=${patientId}` : '';
    const res = await api.get<DeviationAlert[]>(`/alerts${params}`);
    return res.data;
  },

  acknowledgeAlert: async (alertId: string, followUpAction: string): Promise<DeviationAlert> => {
    const res = await api.post<DeviationAlert>(`/alerts/${alertId}/acknowledge`, { followUpAction });
    return res.data;
  },
};

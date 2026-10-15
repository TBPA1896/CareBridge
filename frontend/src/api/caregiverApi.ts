import api from './client';
import { CaregiverLink, CaregiverPatientSummary } from '../types/caregiver';

export const caregiverApi = {
  requestLink: async (data: { patientEmail: string; relationship: string; notes?: string }): Promise<CaregiverLink> => {
    const res = await api.post<CaregiverLink>('/caregiver-links/request', data);
    return res.data;
  },

  getMyLinks: async (): Promise<CaregiverLink[]> => {
    const res = await api.get<CaregiverLink[]>('/caregiver-links');
    return res.data;
  },

  handleLinkAction: async (linkId: string, action: string, notes?: string): Promise<CaregiverLink> => {
    const res = await api.put<CaregiverLink>(`/caregiver-links/${linkId}/action`, { action, notes });
    return res.data;
  },

  getConnectedPatients: async (): Promise<CaregiverPatientSummary[]> => {
    const res = await api.get<CaregiverPatientSummary[]>('/caregiver/patients');
    return res.data;
  },

  getPatientSummary: async (patientId: string): Promise<CaregiverPatientSummary> => {
    const res = await api.get<CaregiverPatientSummary>(`/caregiver/patients/${patientId}/summary`);
    return res.data;
  },
};

import api from './client';
import { DischargeInstruction, StructuredInstructions } from '../types/plan';

export const instructionApi = {
  createInstruction: async (data: any): Promise<DischargeInstruction> => {
    const res = await api.post<DischargeInstruction>('/discharge-instructions', data);
    return res.data;
  },

  getInstruction: async (id: string): Promise<DischargeInstruction> => {
    const res = await api.get<DischargeInstruction>(`/discharge-instructions/${id}`);
    return res.data;
  },

  getPatientInstructions: async (patientId: string): Promise<DischargeInstruction[]> => {
    const res = await api.get<DischargeInstruction[]>(`/discharge-instructions/patient/${patientId}`);
    return res.data;
  },

  getAllInstructions: async (): Promise<DischargeInstruction[]> => {
    const res = await api.get<DischargeInstruction[]>('/discharge-instructions');
    return res.data;
  },

  extractStructuredData: async (id: string): Promise<DischargeInstruction> => {
    const res = await api.post<DischargeInstruction>(`/discharge-instructions/${id}/extract`);
    return res.data;
  },

  reviewAndVerify: async (id: string, data: { structuredInstructions: StructuredInstructions; clinicalNotes?: string; approved: boolean }): Promise<DischargeInstruction> => {
    const res = await api.post<DischargeInstruction>(`/discharge-instructions/${id}/review`, data);
    return res.data;
  },
};

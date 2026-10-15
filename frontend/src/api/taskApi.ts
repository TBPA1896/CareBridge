import api from './client';
import { RecoveryTask, TodayTasksResponse } from '../types/task';

export const taskApi = {
  getTodayTasks: async (patientId?: string, date?: string): Promise<TodayTasksResponse> => {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (date) params.append('date', date);

    const res = await api.get<TodayTasksResponse>(`/recovery-tasks/today?${params.toString()}`);
    return res.data;
  },

  getTask: async (taskId: string): Promise<RecoveryTask> => {
    const res = await api.get<RecoveryTask>(`/recovery-tasks/${taskId}`);
    return res.data;
  },

  getTasksByPlan: async (planId: string): Promise<RecoveryTask[]> => {
    const res = await api.get<RecoveryTask[]>(`/recovery-tasks/plan/${planId}`);
    return res.data;
  },

  updateTaskStatus: async (taskId: string, data: { status: string; actualReportedTime?: string; patientNotes?: string; sideEffects?: string }): Promise<RecoveryTask> => {
    const res = await api.put<RecoveryTask>(`/recovery-tasks/${taskId}/status`, data);
    return res.data;
  },

  reportConcern: async (data: { taskId?: string; title: string; description: string; sideEffects?: string; urgent?: boolean }, patientId?: string) => {
    const params = patientId ? `?patientId=${patientId}` : '';
    const res = await api.post(`/recovery-tasks/concerns${params}`, data);
    return res.data;
  },
};

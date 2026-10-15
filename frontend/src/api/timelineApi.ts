import api from './client';
import { TimelineEvent } from '../types/timeline';

export const timelineApi = {
  getPatientTimeline: async (patientId: string): Promise<TimelineEvent[]> => {
    const res = await api.get<TimelineEvent[]>(`/timeline/patient/${patientId}`);
    return res.data;
  },
};

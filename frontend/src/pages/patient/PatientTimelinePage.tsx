import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timelineApi } from '../../api/timelineApi';
import { TimelineEvent } from '../../types/timeline';
import { ChronologicalTimeline } from '../../components/timeline/ChronologicalTimeline';
import { Clock } from 'lucide-react';

export const PatientTimelinePage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTimeline = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const res = await timelineApi.getPatientTimeline(user.id);
      setEvents(res);
    } catch (e) {
      console.error('Failed to load patient timeline', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-navy-950">Patient Recovery Timeline</h2>
        <p className="text-xs text-slate-500">
          Chronological audit trail of verified plan activations, scheduled doses, completed tasks, and deviations
        </p>
      </div>

      <ChronologicalTimeline events={events} isLoading={isLoading} />
    </div>
  );
};

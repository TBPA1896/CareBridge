import React, { useState } from 'react';
import { TimelineEvent } from '../../types/timeline';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Activity,
  UserCheck,
  Calendar,
  Filter,
} from 'lucide-react';

interface ChronologicalTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

export const ChronologicalTimeline: React.FC<ChronologicalTimelineProps> = ({
  events,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredEvents = events.filter((e) => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return e.eventType === 'TASK_COMPLETED';
    if (filter === 'DEVIATIONS') return e.eventType === 'TASK_LATE' || e.eventType === 'TASK_MISSED';
    if (filter === 'ALERTS') return e.eventType === 'ALERT_TRIGGERED' || e.eventType === 'ALERT_ACKNOWLEDGED';
    if (filter === 'PLAN') return e.eventType === 'PLAN_ACTIVATED';
    return true;
  });

  const getEventIcon = (eventType: string, severity?: string) => {
    switch (eventType) {
      case 'TASK_COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'TASK_LATE':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'TASK_MISSED':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'ALERT_TRIGGERED':
        return <AlertOctagon className="w-5 h-5 text-rose-600" />;
      case 'ALERT_ACKNOWLEDGED':
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      case 'PLAN_ACTIVATED':
        return <Activity className="w-5 h-5 text-brand-600" />;
      default:
        return <Calendar className="w-5 h-5 text-slate-500" />;
    }
  };

  const getEventBorder = (eventType: string) => {
    switch (eventType) {
      case 'TASK_COMPLETED':
        return 'border-l-emerald-500';
      case 'TASK_LATE':
        return 'border-l-amber-500';
      case 'TASK_MISSED':
      case 'ALERT_TRIGGERED':
        return 'border-l-rose-500';
      case 'ALERT_ACKNOWLEDGED':
        return 'border-l-blue-500';
      default:
        return 'border-l-brand-500';
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Filter Timeline:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'COMPLETED', 'DEVIATIONS', 'ALERTS', 'PLAN'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline items */}
      {filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
          No recovery timeline events recorded for this selection.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Dot icon */}
              <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center -translate-x-1/2 group-hover:scale-110 group-hover:border-brand-500 transition-all shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-brand-600" />
              </div>

              {/* Event card */}
              <div
                className={`p-4 bg-white rounded-2xl border border-slate-200 border-l-4 ${getEventBorder(
                  event.eventType
                )} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.eventType, event.severity)}
                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(event.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-7">{event.description}</p>

                <div className="flex items-center gap-2 mt-2 pl-7 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>Actor: <strong>{event.actor}</strong></span>
                  <span>•</span>
                  <span>Category: {event.category}</span>
                  {event.severity && event.severity !== 'LOW' && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-rose-600">Severity: {event.severity}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

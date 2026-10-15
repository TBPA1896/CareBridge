import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caregiverApi } from '../../api/caregiverApi';
import { taskApi } from '../../api/taskApi';
import { alertApi } from '../../api/alertApi';
import { timelineApi } from '../../api/timelineApi';
import { CaregiverPatientSummary } from '../../types/caregiver';
import { TodayTasksResponse, RecoveryTask } from '../../types/task';
import { DeviationAlert } from '../../types/alert';
import { TimelineEvent } from '../../types/timeline';
import { Badge } from '../../components/common/Badge';
import { ChronologicalTimeline } from '../../components/timeline/ChronologicalTimeline';
import { AcknowledgeAlertModal } from '../../components/adherence/AcknowledgeAlertModal';
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  AlertTriangle,
  Activity,
  Heart,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const PatientRecoveryDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [summary, setSummary] = useState<CaregiverPatientSummary | null>(null);
  const [tasksData, setTasksData] = useState<TodayTasksResponse | null>(null);
  const [alerts, setAlerts] = useState<DeviationAlert[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DeviationAlert | null>(null);
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'TASKS' | 'TIMELINE' | 'ALERTS'>('TASKS');
  const [isLoading, setIsLoading] = useState(true);

  const loadPatientData = async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const [sum, tData, alts, tEvents] = await Promise.all([
        caregiverApi.getPatientSummary(patientId),
        taskApi.getTodayTasks(patientId),
        alertApi.getAlerts(patientId),
        timelineApi.getPatientTimeline(patientId),
      ]);
      setSummary(sum);
      setTasksData(tData);
      setAlerts(alts);
      setTimelineEvents(tEvents);
    } catch (e) {
      console.error('Failed to load patient recovery detail', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const unackAlerts = alerts.filter((a) => !a.isAcknowledged);

  return (
    <div className="space-y-6">
      <Link
        to="/caregiver/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Connected Patients</span>
      </Link>

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-2xl flex items-center justify-center shrink-0">
            {summary?.patientName.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-navy-950">{summary?.patientName}</h2>
              <Badge variant={summary?.planStatus === 'ACTIVE' ? 'success' : 'neutral'}>
                {summary?.planStatus || 'No Plan'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active Plan: <strong>{summary?.activePlanTitle}</strong> • {summary?.relationship}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {summary?.patientEmail}
              </span>
              {summary?.patientPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {summary.patientPhone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Compliance Stats */}
        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Today's Progress</span>
            <span className="text-sm font-bold text-slate-800">
              {summary?.todayCompletedTasks} / {summary?.todayTotalTasks}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Adherence</span>
            <span className="text-sm font-bold text-emerald-600">{summary?.adherencePercentage}%</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Open Alerts</span>
            <span
              className={`text-sm font-bold ${
                (summary?.unacknowledgedAlertsCount || 0) > 0 ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {summary?.unacknowledgedAlertsCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'TASKS'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Today's Tasks ({tasksData?.tasks.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'TIMELINE'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Recovery Timeline ({timelineEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'ALERTS'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Deviation Alerts</span>
          {unackAlerts.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
              {unackAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'TASKS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Today's Recovery Task List</h3>
          {tasksData?.tasks.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No tasks scheduled for today.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasksData?.tasks.map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {task.scheduledTime}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{task.title}</span>
                      <Badge
                        variant={
                          task.status === 'COMPLETED'
                            ? 'success'
                            : task.status === 'LATE_COMPLETED'
                            ? 'warning'
                            : task.status === 'MISSED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                    {task.actualReportedTime && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Reported time: {task.actualReportedTime}
                        {task.reportedNotes && ` • Notes: ${task.reportedNotes}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'TIMELINE' && (
        <ChronologicalTimeline events={timelineEvents} isLoading={false} />
      )}

      {activeTab === 'ALERTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Deviation Alerts for {summary?.patientName}</h3>
          {alerts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No alerts found for this patient.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {alerts.map((alert) => (
                <div key={alert.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{alert.taskTitle}</span>
                      <Badge
                        variant={
                          alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {alert.severity}
                      </Badge>
                      {alert.isAcknowledged ? (
                        <Badge variant="success">Acknowledged</Badge>
                      ) : (
                        <Badge variant="danger">Pending Action</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                    {alert.followUpAction && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        Action confirmed: {alert.followUpAction}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!alert.isAcknowledged && (
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setIsAckModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition whitespace-nowrap"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AcknowledgeAlertModal
        alert={selectedAlert}
        isOpen={isAckModalOpen}
        onClose={() => setIsAckModalOpen(false)}
        onSuccess={loadPatientData}
      />
    </div>
  );
};

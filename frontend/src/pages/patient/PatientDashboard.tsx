import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { taskApi } from '../../api/taskApi';
import { planApi } from '../../api/planApi';
import { TodayTasksResponse, RecoveryTask } from '../../types/task';
import { RecoveryPlan } from '../../types/plan';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { TaskLoggerModal } from '../../components/adherence/TaskLoggerModal';
import { ReportConcernModal } from '../../components/adherence/ReportConcernModal';
import {
  CheckSquare,
  Clock,
  Pill,
  Activity,
  AlertTriangle,
  HeartHandshake,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayData, setTodayData] = useState<TodayTasksResponse | null>(null);
  const [activePlan, setActivePlan] = useState<RecoveryPlan | null>(null);
  const [selectedTask, setSelectedTask] = useState<RecoveryTask | null>(null);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isConcernOpen, setIsConcernOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const tasksRes = await taskApi.getTodayTasks();
      setTodayData(tasksRes);

      if (user?.id) {
        const plans = await planApi.getPatientPlans(user.id);
        const active = plans.find((p) => p.status === 'ACTIVE') || plans[0] || null;
        setActivePlan(active);
      }
    } catch (e) {
      console.error('Failed to load patient dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleOpenLogger = (task: RecoveryTask) => {
    setSelectedTask(task);
    setIsLoggerOpen(true);
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'LATE_COMPLETED':
        return <Badge variant="warning">Late Completed</Badge>;
      case 'MISSED':
        return <Badge variant="danger">Missed Dose</Badge>;
      case 'NOT_COMPLETED':
        return <Badge variant="warning">Skipped</Badge>;
      default:
        return <Badge variant="info">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading your recovery dashboard...</span>
      </div>
    );
  }

  const completedCount = todayData?.completedCount || 0;
  const totalCount = todayData?.totalCount || 0;
  const adherenceRate = todayData?.adherencePercentage || 0;
  const pendingTasks = todayData?.tasks.filter((t) => t.status === 'PENDING') || [];
  const nextTask = pendingTasks[0];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-navy-900 to-brand-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-brand-900/10 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-[11px] font-semibold mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-brand-300" />
            <span>Post-Discharge Recovery Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-brand-100 mt-1.5 leading-relaxed">
            {activePlan
              ? `You are on Day ${pendingTasks[0]?.dayNumber || 1} of your ${activePlan.title}. Keep up your medication routine!`
              : 'Follow your doctor-prescribed recovery schedule below.'}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsConcernOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition shadow-md shadow-rose-500/20 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Symptom / Concern
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Tasks"
          value={`${completedCount} / ${totalCount}`}
          subtitle="Tasks completed"
          icon={CheckSquare}
          color="blue"
        />
        <StatCard
          title="Adherence Rate"
          value={`${adherenceRate}%`}
          subtitle="Compliance today"
          icon={Activity}
          color={adherenceRate >= 80 ? 'emerald' : adherenceRate >= 50 ? 'amber' : 'rose'}
        />
        <StatCard
          title="Pending Doses"
          value={todayData?.pendingCount || 0}
          subtitle="Remaining today"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Recovery Duration"
          value={`${activePlan?.durationDays || 14} Days`}
          subtitle={activePlan ? activePlan.diagnosis : 'Active protocol'}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Next Dose Reminder Banner (if any pending) */}
      {nextTask && (
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block">
                Next Scheduled Activity • {nextTask.scheduledTime}
              </span>
              <h4 className="text-sm font-bold text-slate-900">{nextTask.title}</h4>
              <p className="text-xs text-slate-600">{nextTask.description}</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenLogger(nextTask)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap self-start sm:self-auto"
          >
            Record Dose
          </button>
        </div>
      )}

      {/* Main Section: Today's Recovery Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Recovery Checklist</h3>
            <p className="text-xs text-slate-500">Record each medication or recovery action when completed</p>
          </div>
          <Link
            to="/patient/today"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {totalCount === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No recovery tasks scheduled for today. Contact your healthcare team if your plan should be active.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayData?.tasks.map((task) => (
              <div
                key={task.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-2xl transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5">
                    {task.scheduledTime || '—'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{task.title}</span>
                      {getTaskStatusBadge(task.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                    {task.instructions && (
                      <p className="text-[11px] text-brand-700 font-medium mt-0.5">
                        Instructions: {task.instructions}
                      </p>
                    )}
                    {task.actualReportedTime && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Reported taken at: {task.actualReportedTime}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenLogger(task)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                      task.status === 'PENDING'
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {task.status === 'PENDING' ? 'Record Dose' : 'Update Log'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning Signs & Emergency Banner */}
      {activePlan && activePlan.warningSigns && activePlan.warningSigns.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Doctor-Prescribed Warning Signs to Watch For</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {activePlan.warningSigns.map((sign, idx) => (
              <div key={idx} className="p-2.5 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-900 font-medium">
                • {sign}
              </div>
            ))}
          </div>
          {activePlan.emergencyInstructions && (
            <p className="text-xs text-rose-800 mt-2.5 font-medium">
              <strong>Emergency Instruction:</strong> {activePlan.emergencyInstructions}
            </p>
          )}
        </div>
      )}

      {/* Modals */}
      <TaskLoggerModal
        task={selectedTask}
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onSuccess={loadDashboardData}
      />

      <ReportConcernModal
        isOpen={isConcernOpen}
        onClose={() => setIsConcernOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};

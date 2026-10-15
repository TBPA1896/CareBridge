import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { caregiverApi } from '../../api/caregiverApi';
import { alertApi } from '../../api/alertApi';
import { CaregiverPatientSummary } from '../../types/caregiver';
import { DeviationAlert } from '../../types/alert';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { AcknowledgeAlertModal } from '../../components/adherence/AcknowledgeAlertModal';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CaregiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<CaregiverPatientSummary[]>([]);
  const [alerts, setAlerts] = useState<DeviationAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DeviationAlert | null>(null);
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pts, alts] = await Promise.all([
        caregiverApi.getConnectedPatients(),
        alertApi.getAlerts(),
      ]);
      setPatients(pts);
      setAlerts(alts);
    } catch (e) {
      console.error('Failed to load caregiver data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const unackAlerts = alerts.filter((a) => !a.isAcknowledged);
  const criticalAlerts = unackAlerts.filter((a) => a.severity === 'CRITICAL');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="danger">Critical</Badge>;
      case 'HIGH':
        return <Badge variant="danger">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="info">Low</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-navy-900 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-amber-950/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Authorized Caregiver Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Monitoring recovery adherence and clinical alerts for your connected loved ones.
          </p>
        </div>

        <Link
          to="/caregiver/alerts"
          className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-50 font-semibold text-xs transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Review All Alerts ({unackAlerts.length})</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Connected Patients"
          value={patients.length}
          subtitle="Authorized loved ones"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Unresolved Alerts"
          value={unackAlerts.length}
          subtitle="Awaiting action"
          icon={AlertTriangle}
          color={unackAlerts.length > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Critical Alerts"
          value={criticalAlerts.length}
          subtitle="Immediate follow-up"
          icon={ShieldAlert}
          color={criticalAlerts.length > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Resolved Actions"
          value={alerts.filter((a) => a.isAcknowledged).length}
          subtitle="Actions confirmed"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Critical Deviation Warning (if any) */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-3xl text-rose-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                Critical Alert Requiring Attention
              </span>
              <p className="text-xs font-bold text-rose-950">{criticalAlerts[0].message}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedAlert(criticalAlerts[0]);
              setIsAckModalOpen(true);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap self-start sm:self-auto"
          >
            Acknowledge & Record Action
          </button>
        </div>
      )}

      {/* Connected Patients Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Connected Patients Under Your Care</h3>
            <p className="text-xs text-slate-500">Live adherence metrics and plan status</p>
          </div>
          <Link
            to="/caregiver/patients"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            Manage connections
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {patients.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No authorized patient connections found. Request connection using your patient's email.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((p) => (
              <div
                key={p.patientId}
                className="p-5 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-800 font-bold text-lg flex items-center justify-center shrink-0">
                      {p.patientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{p.patientName}</h4>
                      <p className="text-xs text-slate-500">{p.relationship} • {p.patientEmail}</p>
                    </div>
                  </div>
                  <Badge variant={p.planStatus === 'ACTIVE' ? 'success' : 'neutral'}>
                    {p.planStatus || 'No Plan'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Today's Tasks</span>
                    <span className="text-xs font-bold text-slate-800">
                      {p.todayCompletedTasks} / {p.todayTotalTasks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Adherence</span>
                    <span className="text-xs font-bold text-emerald-600">{p.adherencePercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Open Alerts</span>
                    <span
                      className={`text-xs font-bold ${
                        p.unacknowledgedAlertsCount > 0 ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {p.unacknowledgedAlertsCount}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                    Plan: {p.activePlanTitle}
                  </span>
                  <Link
                    to={`/caregiver/patients/${p.patientId}`}
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Alerts Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Adherence Deviation Alerts</h3>
            <p className="text-xs text-slate-500">Late medication, missed tasks, and reported symptoms</p>
          </div>
          <Link
            to="/caregiver/alerts"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            All alerts
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {alerts.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No deviation alerts recorded. All patients are adhering to schedule!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{alert.patientName}</span>
                    <span className="text-xs font-semibold text-slate-500">• {alert.taskTitle}</span>
                    {getSeverityBadge(alert.severity)}
                    {alert.isAcknowledged ? (
                      <Badge variant="success">Resolved</Badge>
                    ) : (
                      <Badge variant="danger">Unacknowledged</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                  {alert.followUpAction && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      Action taken: {alert.followUpAction} (by {alert.acknowledgedByName})
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
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition whitespace-nowrap self-end sm:self-center"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AcknowledgeAlertModal
        alert={selectedAlert}
        isOpen={isAckModalOpen}
        onClose={() => setIsAckModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

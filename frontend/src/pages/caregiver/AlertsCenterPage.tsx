import React, { useState, useEffect } from 'react';
import { alertApi } from '../../api/alertApi';
import { DeviationAlert } from '../../types/alert';
import { Badge } from '../../components/common/Badge';
import { AcknowledgeAlertModal } from '../../components/adherence/AcknowledgeAlertModal';
import { AlertTriangle, Filter, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

export const AlertsCenterPage: React.FC = () => {
  const [alerts, setAlerts] = useState<DeviationAlert[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNACKNOWLEDGED' | 'CRITICAL' | 'RESOLVED'>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<DeviationAlert | null>(null);
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await alertApi.getAlerts();
      setAlerts(res);
    } catch (e) {
      console.error('Failed to load alerts', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'UNACKNOWLEDGED') return !a.isAcknowledged;
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'RESOLVED') return a.isAcknowledged;
    return true;
  });

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

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy-950">Deviation Alerts Center</h2>
          <p className="text-xs text-slate-500">
            Adherence latency breaches, missed medication events, and patient-reported symptoms
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'UNACKNOWLEDGED', 'CRITICAL', 'RESOLVED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No alerts found under this selection.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-3xl border transition shadow-sm hover:shadow-md ${
                !alert.isAcknowledged
                  ? 'bg-white border-slate-200 border-l-4 border-l-rose-500'
                  : 'bg-slate-50/50 border-slate-200 border-l-4 border-l-emerald-500'
              } flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{alert.patientName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700 text-xs">{alert.taskTitle}</span>
                  {getSeverityBadge(alert.severity)}
                  {alert.isAcknowledged ? (
                    <Badge variant="success">Acknowledged</Badge>
                  ) : (
                    <Badge variant="danger">Action Required</Badge>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">{alert.message}</p>

                {alert.details && (
                  <p className="text-[11px] text-slate-500 bg-slate-100/70 p-2 rounded-xl">
                    {alert.details}
                  </p>
                )}

                {alert.isAcknowledged && alert.followUpAction && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100 font-medium">
                    Follow-up Action: <strong>{alert.followUpAction}</strong> (by {alert.acknowledgedByName})
                  </p>
                )}

                <span className="text-[10px] text-slate-400 block">
                  Logged: {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>

              {!alert.isAcknowledged && (
                <button
                  onClick={() => {
                    setSelectedAlert(alert);
                    setIsAckModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition whitespace-nowrap self-start sm:self-center"
                >
                  Acknowledge & Record Follow-up
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AcknowledgeAlertModal
        alert={selectedAlert}
        isOpen={isAckModalOpen}
        onClose={() => setIsAckModalOpen(false)}
        onSuccess={loadAlerts}
      />
    </div>
  );
};

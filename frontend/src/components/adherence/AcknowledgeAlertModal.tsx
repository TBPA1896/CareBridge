import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { DeviationAlert } from '../../types/alert';
import { alertApi } from '../../api/alertApi';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface AcknowledgeAlertModalProps {
  alert: DeviationAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AcknowledgeAlertModal: React.FC<AcknowledgeAlertModalProps> = ({
  alert,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!alert) return null;

  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNotes.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await alertApi.acknowledgeAlert(alert.id, actionNotes.trim());
      setActionNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to acknowledge alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acknowledge Deviation Alert"
      subtitle={`Patient: ${alert.patientName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">{alert.taskTitle}</span>
            <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${getSeverityBadge(alert.severity)}`}>
              {alert.severity}
            </span>
          </div>
          <p className="text-slate-700">{alert.message}</p>
          {alert.details && (
            <p className="text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
              Details: {alert.details}
            </p>
          )}
          <span className="text-[10px] text-slate-400 block pt-1">
            Triggered at: {new Date(alert.createdAt).toLocaleString()}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Follow-Up Action Taken
          </label>
          <textarea
            required
            rows={3}
            placeholder="e.g. Called Rajesh; he confirmed dose was taken after lunch. Will monitor blood pressure evening."
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !actionNotes.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Confirm Action'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { RecoveryTask } from '../../types/task';
import { Modal } from '../common/Modal';
import { taskApi } from '../../api/taskApi';
import { Clock, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

interface TaskLoggerModalProps {
  task: RecoveryTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskLoggerModal: React.FC<TaskLoggerModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!task) return null;

  const nowTime = new Date().toTimeString().slice(0, 5); // "08:30"
  const [status, setStatus] = useState<string>('COMPLETED');
  const [reportedTime, setReportedTime] = useState<string>(task.actualReportedTime || nowTime);
  const [notes, setNotes] = useState<string>(task.reportedNotes || '');
  const [sideEffects, setSideEffects] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate deviation preview in minutes
  const calculateDeviationPreview = (): number => {
    if (!task.scheduledTime || !reportedTime) return 0;
    try {
      const [schedH, schedM] = task.scheduledTime.split(':').map(Number);
      const [actH, actM] = reportedTime.split(':').map(Number);
      return (actH * 60 + actM) - (schedH * 60 + schedM);
    } catch {
      return 0;
    }
  };

  const deviationMins = calculateDeviationPreview();
  const isLate = deviationMins >= 60 && status === 'COMPLETED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // If completed and >60 min late, mark as LATE_COMPLETED
      const finalStatus = isLate ? 'LATE_COMPLETED' : status;

      await taskApi.updateTaskStatus(task.id, {
        status: finalStatus,
        actualReportedTime: status !== 'MISSED' ? reportedTime : undefined,
        patientNotes: notes,
        sideEffects: sideEffects.trim() ? sideEffects : undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record task adherence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Recovery Adherence"
      subtitle={`Scheduled: ${task.scheduledTime || 'N/A'} • ${task.title}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Task Details Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">{task.title}</span>
            <span className="text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Scheduled: {task.scheduledTime}
            </span>
          </div>
          {task.description && <p className="text-slate-500">{task.description}</p>}
          {task.instructions && (
            <p className="text-brand-700 font-medium pt-1 border-t border-slate-200/60 mt-1">
              Instructions: {task.instructions}
            </p>
          )}
        </div>

        {/* Action Status Choice */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Action Taken
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('COMPLETED')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all ${
                status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Taken / Done
            </button>

            <button
              type="button"
              onClick={() => setStatus('MISSED')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all ${
                status === 'MISSED'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-600" />
              Missed Dose
            </button>

            <button
              type="button"
              onClick={() => setStatus('NOT_COMPLETED')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all ${
                status === 'NOT_COMPLETED'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Skipped / Delayed
            </button>
          </div>
        </div>

        {/* Time input (only if taken) */}
        {status !== 'MISSED' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Actual Time Taken
              </label>
              {isLate && (
                <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {deviationMins} mins late ({Math.floor(deviationMins / 60)}h {deviationMins % 60}m delay)
                </span>
              )}
            </div>
            <input
              type="time"
              value={reportedTime}
              onChange={(e) => setReportedTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
            {isLate && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1.5">
                Notice: A delay exceeding 60 minutes will be recorded as a late adherence event and shared with your caregiver.
              </p>
            )}
          </div>
        )}

        {/* Side effects input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Any Side Effects or Discomfort? (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Mild dizziness, nausea, dry mouth"
            value={sideEffects}
            onChange={(e) => setSideEffects(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        {/* Notes input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Patient Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Taken with morning breakfast and water."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
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
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm shadow-brand-600/20"
          >
            {isSubmitting ? 'Recording...' : 'Save Adherence'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

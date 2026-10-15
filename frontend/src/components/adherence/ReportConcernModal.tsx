import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { taskApi } from '../../api/taskApi';
import { AlertTriangle } from 'lucide-react';

interface ReportConcernModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportConcernModal: React.FC<ReportConcernModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await taskApi.reportConcern({
        title,
        description,
        sideEffects: sideEffects.trim() ? sideEffects : undefined,
        urgent: true,
      });

      setTitle('');
      setDescription('');
      setSideEffects('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit concern.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Recovery Symptom or Concern"
      subtitle="Your authorized caregiver will be notified immediately."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            If you are experiencing life-threatening symptoms such as crushing chest pain or severe difficulty breathing, please call emergency services (112 / 911) right away.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Concern Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Fever 101.5°F and chills / Surgical wound redness"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description of Symptoms
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe what you are feeling, when it started, and whether medication was taken."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Associated Side Effects (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Nausea, headache, skin rash"
            value={sideEffects}
            onChange={(e) => setSideEffects(e.target.value)}
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
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm shadow-rose-600/20"
          >
            {isSubmitting ? 'Reporting...' : 'Notify Caregiver'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

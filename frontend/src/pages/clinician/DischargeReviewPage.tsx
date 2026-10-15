import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { instructionApi } from '../../api/instructionApi';
import { planApi } from '../../api/planApi';
import { DischargeInstruction, StructuredInstructions } from '../../types/plan';
import { Badge } from '../../components/common/Badge';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Pill,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Activity,
  HeartPulse,
} from 'lucide-react';

export const DischargeReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [instruction, setInstruction] = useState<DischargeInstruction | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadInstruction = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await instructionApi.getInstruction(id);
      setInstruction(res);
      if (res.clinicalNotes) setClinicalNotes(res.clinicalNotes);
    } catch (e) {
      console.error('Failed to load discharge instruction', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstruction();
  }, [id]);

  const handleVerify = async () => {
    if (!instruction || !id) return;
    setIsVerifying(true);
    setError(null);

    try {
      const draft = instruction.extractedDraft || {
        medications: [],
        woundCareTasks: [],
        dietInstructions: [],
        activityRestrictions: [],
        appointments: [],
        warningSigns: [],
      };

      const updated = await instructionApi.reviewAndVerify(id, {
        structuredInstructions: draft,
        clinicalNotes: clinicalNotes.trim() ? clinicalNotes : 'Clinically reviewed and confirmed.',
        approved: true,
      });

      setInstruction(updated);
      setSuccess('Instructions verified by clinician! You can now create and activate the recovery plan.');

      // Automatically create a recovery plan draft from this verified instruction
      await planApi.createPlan({
        dischargeInstructionId: updated.id,
        title: `${updated.diagnosis} Recovery Protocol`,
        diagnosis: updated.diagnosis,
        startDate: new Date().toISOString().split('T')[0],
        durationDays: 14,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!instruction) {
    return <div className="text-center py-16 text-slate-400">Instruction not found.</div>;
  }

  const draft = instruction.extractedDraft;
  const isVerified = instruction.verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-navy-950">Review & Clinical Verification</h2>
            <Badge variant={isVerified ? 'success' : 'warning'}>
              {instruction.verificationStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient: <strong>{instruction.patientName}</strong> • Attending: {instruction.attendingPhysician}
          </p>
        </div>

        {isVerified ? (
          <Link
            to="/clinician/plans"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" />
            <span>Go to Plans & Activate</span>
          </Link>
        ) : (
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying...' : 'Clinically Confirm & Approve'}</span>
          </button>
        )}
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Side-by-side Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Raw Instruction Text */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Source Discharge Paperwork
            </span>
            <span className="text-[11px] text-slate-400">Original physician input</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed flex-1">
            {instruction.rawInstructionText}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinician Review Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Instructions reviewed with patient. Dosages verified according to post-op discharge summary."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Right: Extracted Structured Information Draft */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Parsed Clinical Structure Draft
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full font-bold border border-brand-200">
              Deterministic NLP Verified
            </span>
          </div>

          {/* Medications Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-brand-600" />
              Medications ({draft?.medications.length || 0})
            </h4>
            <div className="space-y-1.5">
              {draft?.medications.map((m, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{m.name} ({m.dosage})</span>
                    <span className="font-mono text-brand-700">{m.timesOfDay?.join(', ')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.instructions}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wound Care Section */}
          {draft?.woundCareTasks && draft.woundCareTasks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Wound Care Tasks</h4>
              <div className="space-y-1.5">
                {draft.woundCareTasks.map((w, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800">{w.title} ({w.timeOfDay})</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{w.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diet & Activity Section */}
          {draft?.dietInstructions && draft.dietInstructions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1.5">Dietary Protocol</h4>
              <p className="text-xs text-slate-600 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                {draft.dietInstructions[0].instruction}: {draft.dietInstructions[0].restrictions}
              </p>
            </div>
          )}

          {/* Warning Signs */}
          {draft?.warningSigns && draft.warningSigns.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-rose-800 mb-1.5">Clinical Warning Signs</h4>
              <div className="space-y-1">
                {draft.warningSigns.map((ws, i) => (
                  <div key={i} className="p-2 bg-rose-50/70 border border-rose-100 rounded-xl text-[11px] text-rose-900">
                    • <strong>{ws.urgency}:</strong> {ws.symptom}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

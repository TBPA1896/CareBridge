import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { planApi } from '../../api/planApi';
import { instructionApi } from '../../api/instructionApi';
import { RecoveryPlan, DischargeInstruction, MedicationItem } from '../../types/plan';
import { Pill, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

export const MedicationSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<RecoveryPlan | null>(null);
  const [instruction, setInstruction] = useState<DischargeInstruction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const plans = await planApi.getPatientPlans(user.id);
        const active = plans.find((p) => p.status === 'ACTIVE') || plans[0] || null;
        setActivePlan(active);

        if (active?.dischargeInstructionId) {
          const inst = await instructionApi.getInstruction(active.dischargeInstructionId);
          setInstruction(inst);
        }
      } catch (e) {
        console.error('Failed to load medication schedule', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlan();
  }, [user]);

  const medications: MedicationItem[] = instruction?.extractedDraft?.medications || [];

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy-950">Verified Medication Schedule</h2>
          <p className="text-xs text-slate-500">
            Prescriptions verified by hospital attending physician. Immutable by patient.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified by {activePlan?.verifiedByName || 'Authorized Doctor'}</span>
        </div>
      </div>

      {/* Prescription Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          Dosages and medication timings are strictly defined by your doctor. Never change your dose or skip medication without consulting your healthcare provider. Record actual ingestion times accurately to maintain safe care coordination.
        </span>
      </div>

      {/* Medications Table / Cards */}
      {medications.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No verified medications found in active recovery plan.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Medication</th>
                  <th className="py-3.5 px-4">Dosage</th>
                  <th className="py-3.5 px-4">Frequency</th>
                  <th className="py-3.5 px-4">Daily Times</th>
                  <th className="py-3.5 px-4 sm:px-6">Clinical Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {medications.map((med, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{med.name}</span>
                          {med.durationDays && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Course: {med.durationDays} days
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{med.dosage}</td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px]">
                        {med.frequency.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-brand-700 font-semibold">
                      {med.timesOfDay?.join(', ') || '08:00'}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-600 max-w-xs">
                      {med.instructions || 'Take as instructed by physician'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

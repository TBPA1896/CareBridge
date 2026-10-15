import React, { useState, useEffect } from 'react';
import { planApi } from '../../api/planApi';
import { RecoveryPlan } from '../../types/plan';
import { Badge } from '../../components/common/Badge';
import { Activity, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlanActivationPage: React.FC = () => {
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const res = await planApi.getAllPlans();
      setPlans(res);
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleActivate = async (planId: string) => {
    setActivatingId(planId);
    setError(null);
    setSuccessMessage(null);

    try {
      await planApi.activatePlan(planId);
      setSuccessMessage('Recovery plan successfully activated! Daily tasks have been generated in MongoDB.');
      loadPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate recovery plan.');
    } finally {
      setActivatingId(null);
    }
  };

  const getPlanBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'VERIFIED':
        return <Badge variant="info">Verified (Ready to Activate)</Badge>;
      case 'DRAFT':
        return <Badge variant="warning">Draft (Unverified)</Badge>;
      case 'COMPLETED':
        return <Badge variant="purple">Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy-950">Recovery Plans & Workflow Activation</h2>
          <p className="text-xs text-slate-500">
            Activate verified plans to run the Recovery Workflow Engine and generate patient daily schedules
          </p>
        </div>

        <Link
          to="/clinician/create-instruction"
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition"
        >
          Create New Discharge Plan
        </Link>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No recovery plans found. Create and verify a discharge instruction to generate plans.
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{plan.title}</h3>
                  {getPlanBadge(plan.status)}
                </div>

                <p className="text-xs text-slate-600">
                  Patient: <strong>{plan.patientName}</strong> • Diagnosis: {plan.diagnosis}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Duration: <strong>{plan.durationDays} Days</strong></span>
                  <span>•</span>
                  <span>Start: {plan.startDate}</span>
                  <span>•</span>
                  <span>End: {plan.endDate}</span>
                  {plan.verifiedByName && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">Verified by: {plan.verifiedByName}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {plan.status === 'VERIFIED' && (
                  <button
                    onClick={() => handleActivate(plan.id)}
                    disabled={activatingId === plan.id}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Activity className="w-4 h-4" />
                    <span>{activatingId === plan.id ? 'Generating Tasks...' : 'Activate Plan'}</span>
                  </button>
                )}

                {plan.status === 'ACTIVE' && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tasks Active in Database</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

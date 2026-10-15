import React from 'react';
import { ShieldAlert, HeartPulse, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SafetyInfoPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-navy-950">Clinical Disclaimer & Safety Guidelines</h1>
        <p className="text-xs text-slate-500 mt-1">CareBridge Post-Discharge Healthcare Architecture Protocol</p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Urgent Emergency Warning */}
        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl text-rose-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-800 text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Emergency Medical Protocol</span>
          </div>
          <p className="text-xs text-rose-900 leading-relaxed">
            CareBridge is a post-discharge coordination and adherence monitoring platform. It is <strong>NOT a substitute for emergency medical care</strong>. If you experience severe chest pain, radiating arm pain, acute difficulty breathing, sudden slurred speech, or heavy bleeding from surgical sites, dial <strong>112 / 911</strong> immediately or visit the nearest hospital emergency room.
          </p>
        </div>

        {/* Clinical Gates & AI/NLP Boundaries */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Human-in-the-Loop Clinical Verification Gate</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All recovery instructions extracted via AI or deterministic NLP parsers are strictly classified as <strong>DRAFT</strong> information until reviewed, verified, and explicitly activated by an authorized medical professional (doctor, clinician, or discharge nurse).
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
            <li>Patients cannot modify clinical dosages, medication formulations, or treatment duration.</li>
            <li>Caregivers receive read-only recovery visibility and cannot alter prescriptions or diagnose conditions.</li>
            <li>No artificial intelligence generates unsolicited medical advice or amends prescription plans autonomously.</li>
          </ul>
        </div>

        {/* Data Privacy & Role Boundaries */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Data Privacy & Role-Based Access Control</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Caregiver links require explicit mutual consent and authorization by the patient. Patients retain full control to approve, modify, or revoke caregiver visibility at any time from their profile settings.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            All passwords are encrypted with BCrypt hashing, and APIs enforce token validation and patient ownership on every data request.
          </p>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/"
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

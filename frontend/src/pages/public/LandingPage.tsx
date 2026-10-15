import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Shield,
  Activity,
  BellRing,
  FileCheck,
  CheckCircle2,
  Users,
  ArrowRight,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      {/* Top Banner */}
      <div className="bg-brand-900 text-brand-100 px-4 py-2 text-xs text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span>Technical Training Demonstration Edition • Full-Stack Spring Boot + React + MongoDB</span>
      </div>

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-navy-900 to-brand-700 bg-clip-text text-transparent">
              CareBridge
            </h1>
            <p className="text-xs text-slate-500 font-medium">Bridging the gap between hospital and home</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => {
                if (user.role === 'PATIENT') navigate('/patient/dashboard');
                else if (user.role === 'CAREGIVER') navigate('/caregiver/dashboard');
                else if (user.role === 'CLINICIAN') navigate('/clinician/plans');
                else navigate('/admin/dashboard');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm"
            >
              Go to Workspace ({user.role})
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-brand-600 transition px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition px-4 py-2 rounded-xl shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <Activity className="w-3.5 h-3.5" />
          <span>Intelligent Post-Discharge Recovery & Care Management</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-950 tracking-tight leading-tight mb-6">
          Never miss a healing step <br className="hidden sm:inline" />
          between <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">Hospital and Home</span>.
        </h2>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
          CareBridge converts complex physician discharge summaries into clear daily schedules, tracks patient-reported task adherence, detects dosage lateness via a clinical rules engine, and alerts authorized family caregivers when deviations occur.
        </p>

      </section>

      {/* 4 Core Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-navy-950">How CareBridge Works</h3>
          <p className="text-sm text-slate-500 mt-1">An integrated workflow ensuring patient safety at every touchpoint</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Discharge Extraction</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clinical instructions are structured via NLP regex parser and held in draft status.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Doctor Verification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authorized clinical staff confirms dosages and activates the personalized day-by-day schedule.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-4">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Patient Daily Logging</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patients mark medications taken, note actual timestamps, and report any adverse side effects.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm mb-4">
              4
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Caregiver Alert Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deviations exceeding 60 minutes or repeated missed doses immediately trigger alerts for loved ones.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-800">CareBridge Health Platform</span>
            <span>• Technical Training Capstone</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/safety" className="hover:text-brand-600 transition">
              Clinical Disclaimer & Safety
            </Link>
            <Link to="/login" className="hover:text-brand-600 transition">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

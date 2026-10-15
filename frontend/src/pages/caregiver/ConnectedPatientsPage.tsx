import React, { useState, useEffect } from 'react';
import { caregiverApi } from '../../api/caregiverApi';
import { CaregiverLink, CaregiverPatientSummary } from '../../types/caregiver';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Users, UserPlus, ArrowRight, Mail, Phone, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConnectedPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<CaregiverPatientSummary[]>([]);
  const [links, setLinks] = useState<CaregiverLink[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [relationship, setRelationship] = useState('Daughter');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pts, myLinks] = await Promise.all([
        caregiverApi.getConnectedPatients(),
        caregiverApi.getMyLinks(),
      ]);
      setPatients(pts);
      setLinks(myLinks);
    } catch (e) {
      console.error('Failed to load patient connections', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await caregiverApi.requestLink({
        patientEmail,
        relationship,
        notes: notes.trim() ? notes : undefined,
      });
      setSuccess('Connection request sent to patient. They can approve it from their profile.');
      setPatientEmail('');
      setNotes('');
      setIsRequestModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send connection request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy-950">Connected Patients</h2>
          <p className="text-xs text-slate-500">
            View authorized patients and link with new family members
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Request Patient Connection</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          {success}
        </div>
      )}

      {/* Approved Patients Cards */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No approved patient connections yet. Click "Request Patient Connection" above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((p) => (
            <div
              key={p.patientId}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center shrink-0">
                      {p.patientName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{p.patientName}</h3>
                      <p className="text-xs text-slate-500">{p.relationship}</p>
                    </div>
                  </div>
                  <Badge variant={p.planStatus === 'ACTIVE' ? 'success' : 'neutral'}>
                    {p.planStatus || 'No Plan'}
                  </Badge>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.patientEmail}</span>
                  </p>
                  {p.patientPhone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.patientPhone}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Today's Adherence</span>
                    <span className="text-sm font-bold text-emerald-600">{p.adherencePercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Open Alerts</span>
                    <span
                      className={`text-sm font-bold ${
                        p.unacknowledgedAlertsCount > 0 ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {p.unacknowledgedAlertsCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/caregiver/patients/${p.patientId}`}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Patient Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connection Requests Status Table */}
      {links.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Your Connection Requests Status</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {links.map((link) => (
              <div key={link.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{link.patientName || link.patientEmail}</span>
                  <span className="text-slate-400 ml-2">({link.relationship})</span>
                </div>
                <Badge
                  variant={
                    link.status === 'APPROVED'
                      ? 'success'
                      : link.status === 'PENDING'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {link.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Connection Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Connect with a Patient"
        subtitle="Patient must approve the request to grant recovery access."
        maxWidth="md"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rajesh.patel@carebridge.health"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Relationship to the Patient
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Daughter, Spouse, Son, Home Health Aide"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note to Patient (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Hi dad, connecting so I can monitor your medication schedule."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

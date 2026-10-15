import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../api/patientApi';
import { caregiverApi } from '../../api/caregiverApi';
import { UserProfileResponse } from '../../types/auth';
import { CaregiverLink } from '../../types/caregiver';
import { Badge } from '../../components/common/Badge';
import {
  User,
  Heart,
  ShieldAlert,
  Phone,
  Mail,
  Users,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [links, setLinks] = useState<CaregiverLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [prof, userLinks] = await Promise.all([
        patientApi.getMyProfile(),
        caregiverApi.getMyLinks(),
      ]);
      setProfileData(prof);
      setLinks(userLinks);
    } catch (e) {
      console.error('Failed to load profile data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLinkAction = async (linkId: string, action: 'APPROVE' | 'REJECT' | 'REVOKE') => {
    try {
      await caregiverApi.handleLinkAction(linkId, action);
      setActionSuccess(`Caregiver access updated: ${action.toLowerCase()}d successfully.`);
      loadProfile();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (e) {
      console.error('Failed to update caregiver link', e);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const profile = profileData?.profile;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-navy-950">Patient Profile & Caregiver Access</h2>
        <p className="text-xs text-slate-500">
          Manage your health information and authorize family caregivers to monitor your recovery
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-2xl shadow-sm">
            {profileData?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{profileData?.fullName}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {profileData?.email}
              {profileData?.phone && (
                <>
                  <span>•</span>
                  <Phone className="w-3.5 h-3.5" /> {profileData.phone}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Clinical Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Date of Birth / Blood Group
            </span>
            <p className="text-sm font-bold text-slate-800">
              {profile?.dateOfBirth ? String(profile.dateOfBirth) : 'Not specified'} • Blood: {profile?.bloodGroup || 'B+'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Emergency Contact
            </span>
            <p className="text-sm font-bold text-slate-800">
              {profile?.emergencyContactName || 'None listed'}
            </p>
            <p className="text-xs text-slate-500">{profile?.emergencyContactPhone}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Known Allergies
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile?.allergies && profile.allergies.length > 0 ? (
                profile.allergies.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No known allergies</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Authorized Caregiver Relationships Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>Authorized Family Caregivers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Only authorized caregivers can receive deviation alerts and view your recovery compliance.
            </p>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No caregivers have requested connection yet. Share your registered email with your family caregiver.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {links.map((link) => (
              <div
                key={link.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{link.caregiverName}</span>
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
                  <p className="text-xs text-slate-500 mt-0.5">
                    Relationship: {link.relationship} • Email: {link.caregiverEmail}
                  </p>
                  {link.notes && <p className="text-xs text-slate-400 mt-1">"{link.notes}"</p>}
                </div>

                <div className="flex items-center gap-2">
                  {link.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleLinkAction(link.id, 'APPROVE')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Access
                      </button>
                      <button
                        onClick={() => handleLinkAction(link.id, 'REJECT')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {link.status === 'APPROVED' && (
                    <button
                      onClick={() => handleLinkAction(link.id, 'REVOKE')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition border border-rose-200"
                    >
                      Revoke Access
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

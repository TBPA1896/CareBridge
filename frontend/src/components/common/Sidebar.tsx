import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Pill,
  Clock,
  Calendar,
  UserCheck,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  ShieldAlert,
  ClipboardCheck,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/patient/today', label: "Today's Recovery", icon: CheckSquare },
    { to: '/patient/medications', label: 'Medications', icon: Pill },
    { to: '/patient/timeline', label: 'Recovery Timeline', icon: Clock },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/profile', label: 'Profile & Caregivers', icon: UserCheck },
  ];

  const caregiverLinks = [
    { to: '/caregiver/dashboard', label: 'Care Dashboard', icon: LayoutDashboard },
    { to: '/caregiver/patients', label: 'Connected Patients', icon: Users },
    { to: '/caregiver/alerts', label: 'Deviation Alerts', icon: AlertTriangle },
    { to: '/caregiver/timeline', label: 'Patient Timeline', icon: Clock },
  ];

  const clinicianLinks = [
    { to: '/clinician/plans', label: 'Recovery Plans', icon: Activity },
    { to: '/clinician/create-instruction', label: 'Create Discharge', icon: FileText },
    { to: '/clinician/instructions', label: 'Review & Verify', icon: ClipboardCheck },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/plans', label: 'Recovery Plans', icon: Activity },
    { to: '/admin/links', label: 'Caregiver Links', icon: UserCheck },
    { to: '/admin/audit-logs', label: 'System Audit Logs', icon: Shield },
  ];

  let links = patientLinks;
  if (user.role === 'CAREGIVER') links = caregiverLinks;
  if (user.role === 'CLINICIAN') links = clinicianLinks;
  if (user.role === 'ADMIN') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4 shrink-0 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-3">
        {user.role} WORKSPACE
      </div>

      <nav className="space-y-1.5 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm border border-brand-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Emergency reminder card */}
      <div className="mt-auto p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-900">
        <div className="flex items-center gap-1.5 font-semibold text-rose-700 mb-1">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Emergency Support</span>
        </div>
        <p className="text-[11px] leading-relaxed text-rose-800">
          Experiencing acute chest pain or severe shortness of breath? Dial <strong>112 / 911</strong> immediately.
        </p>
      </div>
    </aside>
  );
};

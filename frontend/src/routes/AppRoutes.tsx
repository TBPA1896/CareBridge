import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { SafetyInfoPage } from '../pages/public/SafetyInfoPage';

// Patient Pages
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { TodayTasksPage } from '../pages/patient/TodayTasksPage';
import { MedicationSchedulePage } from '../pages/patient/MedicationSchedulePage';
import { PatientTimelinePage } from '../pages/patient/PatientTimelinePage';
import { PatientAppointmentsPage } from '../pages/patient/PatientAppointmentsPage';
import { PatientProfilePage } from '../pages/patient/PatientProfilePage';

// Caregiver Pages
import { CaregiverDashboard } from '../pages/caregiver/CaregiverDashboard';
import { ConnectedPatientsPage } from '../pages/caregiver/ConnectedPatientsPage';
import { PatientRecoveryDetail } from '../pages/caregiver/PatientRecoveryDetail';
import { AlertsCenterPage } from '../pages/caregiver/AlertsCenterPage';

// Clinician Pages
import { DischargeInstructionCreatePage } from '../pages/clinician/DischargeInstructionCreatePage';
import { DischargeReviewPage } from '../pages/clinician/DischargeReviewPage';
import { PlanActivationPage } from '../pages/clinician/PlanActivationPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/safety" element={<SafetyInfoPage />} />

      {/* Patient Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route element={<AppLayout />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/today" element={<TodayTasksPage />} />
          <Route path="/patient/medications" element={<MedicationSchedulePage />} />
          <Route path="/patient/timeline" element={<PatientTimelinePage />} />
          <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
          <Route path="/patient/profile" element={<PatientProfilePage />} />
        </Route>
      </Route>

      {/* Caregiver Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CAREGIVER']} />}>
        <Route element={<AppLayout />}>
          <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
          <Route path="/caregiver/patients" element={<ConnectedPatientsPage />} />
          <Route path="/caregiver/patients/:patientId" element={<PatientRecoveryDetail />} />
          <Route path="/caregiver/alerts" element={<AlertsCenterPage />} />
          <Route path="/caregiver/timeline" element={<PatientTimelinePage />} />
        </Route>
      </Route>

      {/* Clinician Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CLINICIAN', 'ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route path="/clinician/plans" element={<PlanActivationPage />} />
          <Route path="/clinician/create-instruction" element={<DischargeInstructionCreatePage />} />
          <Route path="/clinician/instructions" element={<PlanActivationPage />} />
          <Route path="/clinician/instructions/:id/review" element={<DischargeReviewPage />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/plans" element={<PlanActivationPage />} />
          <Route path="/admin/links" element={<ConnectedPatientsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

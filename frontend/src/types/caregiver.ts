export type CaregiverLinkStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export interface CaregiverLink {
  id: string;
  patientId: string;
  caregiverId: string;
  patientName: string;
  caregiverName: string;
  patientEmail: string;
  caregiverEmail: string;
  relationship: string;
  status: CaregiverLinkStatus;
  canReceiveAlerts: boolean;
  requestedAt?: string;
  respondedAt?: string;
  notes?: string;
}

export interface CaregiverPatientSummary {
  linkId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  relationship: string;
  activePlanId?: string;
  activePlanTitle?: string;
  planStatus?: string;
  todayTotalTasks: number;
  todayCompletedTasks: number;
  adherencePercentage: number;
  unacknowledgedAlertsCount: number;
}

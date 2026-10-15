export type AlertType =
  | 'LATE_MEDICATION'
  | 'MISSED_MEDICATION'
  | 'REPEATED_DEVIATION'
  | 'PATIENT_CONCERN'
  | 'MISSED_APPOINTMENT'
  | 'CRITICAL_WARNING_SIGN';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DeviationAlert {
  id: string;
  patientId: string;
  patientName: string;
  recoveryPlanId?: string;
  taskId?: string;
  taskTitle: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  details?: string;
  deviationMinutes?: number;
  isAcknowledged: boolean;
  acknowledgedByUserId?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  followUpAction?: string;
  createdAt: string;
}

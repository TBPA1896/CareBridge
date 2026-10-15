export type NotificationType =
  | 'TASK_REMINDER'
  | 'OVERDUE_TASK'
  | 'DEVIATION_ALERT'
  | 'CAREGIVER_ALERT'
  | 'APPOINTMENT_REMINDER'
  | 'ALERT_ACKNOWLEDGED'
  | 'PLAN_UPDATED'
  | 'CAREGIVER_REQUEST';

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  patientId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceEntityId?: string;
  createdAt: string;
}

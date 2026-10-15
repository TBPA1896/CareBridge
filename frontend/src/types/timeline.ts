export interface TimelineEvent {
  id: string;
  eventType: string; // 'TASK_COMPLETED' | 'TASK_LATE' | 'TASK_MISSED' | 'ALERT_TRIGGERED' | 'ALERT_ACKNOWLEDGED' | 'PLAN_ACTIVATED' | 'PATIENT_CONCERN'
  timestamp: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  actor: string;
  referenceId?: string;
}

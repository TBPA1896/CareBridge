export type TaskCategory =
  | 'MEDICATION'
  | 'WOUND_CARE'
  | 'DIET'
  | 'ACTIVITY_RESTRICTION'
  | 'FOLLOW_UP'
  | 'WARNING_SIGN'
  | 'GENERAL';

export type TaskStatus = 'PENDING' | 'COMPLETED' | 'LATE_COMPLETED' | 'MISSED' | 'NOT_COMPLETED';

export interface RecoveryTask {
  id: string;
  recoveryPlanId: string;
  patientId: string;
  dayNumber: number;
  scheduledDate: string;
  scheduledTime: string;
  category: TaskCategory;
  title: string;
  description: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  status: TaskStatus;
  isRecurring: boolean;
  sourceInstructionRef?: string;
  actualReportedTime?: string;
  reportedNotes?: string;
  completedAt?: string;
}

export interface TodayTasksResponse {
  date: string;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  missedCount: number;
  adherencePercentage: number;
  tasks: RecoveryTask[];
}

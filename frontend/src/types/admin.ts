export interface DashboardStats {
  totalUsers: number;
  totalPatients: number;
  totalCaregivers: number;
  activeRecoveryPlans: number;
  totalTasks: number;
  totalCompletedTasks: number;
  overallAdherenceRate: number;
  activeAlertsCount: number;
  unacknowledgedAlertsCount: number;
  tasksByCategory: Record<string, number>;
  alertsBySeverity: Record<string, number>;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  timestamp: string;
}

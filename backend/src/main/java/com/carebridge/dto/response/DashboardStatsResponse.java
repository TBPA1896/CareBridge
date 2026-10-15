package com.carebridge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalPatients;
    private long totalCaregivers;
    private long activeRecoveryPlans;
    private long totalTasks;
    private long totalCompletedTasks;
    private double overallAdherenceRate;
    private long activeAlertsCount;
    private long unacknowledgedAlertsCount;
    private Map<String, Long> tasksByCategory;
    private Map<String, Long> alertsBySeverity;
}

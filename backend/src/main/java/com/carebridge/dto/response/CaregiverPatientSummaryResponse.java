package com.carebridge.dto.response;

import com.carebridge.model.PlanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaregiverPatientSummaryResponse {
    private String linkId;
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String relationship;
    private String activePlanId;
    private String activePlanTitle;
    private PlanStatus planStatus;
    private int todayTotalTasks;
    private int todayCompletedTasks;
    private double adherencePercentage;
    private long unacknowledgedAlertsCount;
}

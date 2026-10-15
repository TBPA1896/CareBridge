package com.carebridge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventResponse {
    private String id;
    private String eventType; // "TASK_COMPLETED", "TASK_LATE", "TASK_MISSED", "ALERT_TRIGGERED", "ALERT_ACKNOWLEDGED", "PLAN_ACTIVATED", "PATIENT_CONCERN"
    private Instant timestamp;
    private String title;
    private String description;
    private String category;
    private String severity;
    private String status;
    private String actor;
    private String referenceId;
}

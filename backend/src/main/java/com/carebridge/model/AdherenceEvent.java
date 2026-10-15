package com.carebridge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "adherenceEvents")
@CompoundIndex(name = "patient_reported_idx", def = "{'patientId': 1, 'reportedAt': -1}")
public class AdherenceEvent {

    @Id
    private String id;

    @Indexed
    private String taskId;

    @Indexed
    private String patientId;

    @Indexed
    private String recoveryPlanId;

    private String taskTitle;

    private TaskCategory category;

    private LocalDateTime scheduledDateTime;

    private LocalDateTime actualReportedDateTime;

    private Long deviationMinutes;

    private AdherenceStatus status;

    private String patientNotes;

    private String sideEffects;

    private Instant reportedAt;
}

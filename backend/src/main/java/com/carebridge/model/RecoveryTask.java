package com.carebridge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "recoveryTasks")
@CompoundIndex(name = "plan_date_idx", def = "{'recoveryPlanId': 1, 'scheduledDate': 1}")
@CompoundIndex(name = "patient_date_idx", def = "{'patientId': 1, 'scheduledDate': 1}")
public class RecoveryTask {

    @Id
    private String id;

    @Indexed
    private String recoveryPlanId;

    @Indexed
    private String patientId;

    private Integer dayNumber;

    @Indexed
    private LocalDate scheduledDate;

    private String scheduledTime; // e.g. "08:00"

    private TaskCategory category;

    private String title;

    private String description;

    private String dosage;

    private String frequency;

    private String instructions;

    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Builder.Default
    private boolean isRecurring = false;

    private String sourceInstructionRef;

    private String actualReportedTime; // e.g. "08:45"

    private String reportedNotes;

    private Instant completedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

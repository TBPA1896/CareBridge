package com.carebridge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "deviationAlerts")
@CompoundIndex(name = "patient_ack_idx", def = "{'patientId': 1, 'isAcknowledged': 1}")
@CompoundIndex(name = "created_desc_idx", def = "{'createdAt': -1}")
public class DeviationAlert {

    @Id
    private String id;

    @Indexed
    private String patientId;

    private String patientName;

    @Indexed
    private String recoveryPlanId;

    private String taskId;

    private String taskTitle;

    private AlertType alertType;

    private AlertSeverity severity;

    private String message;

    private String details;

    private Long deviationMinutes;

    @Builder.Default
    private boolean isAcknowledged = false;

    private String acknowledgedByUserId;

    private String acknowledgedByName;

    private Instant acknowledgedAt;

    private String followUpAction;

    @CreatedDate
    private Instant createdAt;
}

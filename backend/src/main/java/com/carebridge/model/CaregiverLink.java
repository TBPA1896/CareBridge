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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "caregiverLinks")
@CompoundIndex(name = "patient_caregiver_idx", def = "{'patientId': 1, 'caregiverId': 1}", unique = true)
public class CaregiverLink {

    @Id
    private String id;

    @Indexed
    private String patientId;

    @Indexed
    private String caregiverId;

    private String patientName;

    private String caregiverName;

    private String patientEmail;

    private String caregiverEmail;

    private String relationship;

    @Builder.Default
    private CaregiverLinkStatus status = CaregiverLinkStatus.PENDING;

    @Builder.Default
    private boolean canReceiveAlerts = true;

    private Instant requestedAt;

    private Instant respondedAt;

    private String notes;
}

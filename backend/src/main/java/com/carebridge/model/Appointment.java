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
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
@CompoundIndex(name = "patient_datetime_idx", def = "{'patientId': 1, 'scheduledDateTime': 1}")
public class Appointment {

    @Id
    private String id;

    @Indexed
    private String patientId;

    @Indexed
    private String recoveryPlanId;

    private String doctorName;

    private String department;

    private String clinicLocation;

    private LocalDateTime scheduledDateTime;

    private String purpose;

    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    private String notes;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

package com.carebridge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patientProfiles")
public class PatientProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    private String emergencyContactName;

    private String emergencyContactPhone;

    @Builder.Default
    private List<String> allergies = new ArrayList<>();

    @Builder.Default
    private List<String> medicalConditions = new ArrayList<>();

    private String activeRecoveryPlanId;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

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
@Document(collection = "recoveryPlans")
public class RecoveryPlan {

    @Id
    private String id;

    @Indexed
    private String patientId;

    private String patientName;

    @Indexed
    private String dischargeInstructionId;

    private String title;

    private String diagnosis;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer durationDays;

    @Builder.Default
    private PlanStatus status = PlanStatus.DRAFT;

    @Builder.Default
    private List<String> warningSigns = new ArrayList<>();

    private String emergencyInstructions;

    private String verifiedByUserId;

    private String verifiedByName;

    private Instant verifiedAt;

    private Instant activatedAt;

    @Builder.Default
    private int version = 1;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

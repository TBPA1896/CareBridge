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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "dischargeInstructions")
public class DischargeInstruction {

    @Id
    private String id;

    @Indexed
    private String patientId;

    private String patientName;

    private String hospitalName;

    private String attendingPhysician;

    private LocalDate dischargeDate;

    private String diagnosis;

    private String rawInstructionText;

    private String uploadedDocumentName;

    private StructuredInstructions extractedDraft;

    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.DRAFT;

    private String verifiedByUserId;

    private String verifiedByName;

    private Instant verifiedAt;

    private String clinicalNotes;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

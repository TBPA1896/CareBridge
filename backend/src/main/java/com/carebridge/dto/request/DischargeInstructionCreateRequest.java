package com.carebridge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DischargeInstructionCreateRequest {

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    @NotBlank(message = "Attending physician is required")
    private String attendingPhysician;

    @NotNull(message = "Discharge date is required")
    private LocalDate dischargeDate;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Discharge instruction text is required")
    private String rawInstructionText;

    private String uploadedDocumentName;
}

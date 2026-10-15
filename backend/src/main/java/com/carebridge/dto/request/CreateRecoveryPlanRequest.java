package com.carebridge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRecoveryPlanRequest {

    @NotBlank(message = "Discharge instruction ID is required")
    private String dischargeInstructionId;

    @NotBlank(message = "Title is required")
    private String title;

    private String diagnosis;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private Integer durationDays; // default 14

    private List<String> warningSigns;

    private String emergencyInstructions;
}

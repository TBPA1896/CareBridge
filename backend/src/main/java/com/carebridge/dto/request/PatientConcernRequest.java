package com.carebridge.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientConcernRequest {

    private String taskId;

    @NotBlank(message = "Concern title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String sideEffects;

    private boolean urgent;
}

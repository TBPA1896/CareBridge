package com.carebridge.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaregiverLinkRequest {

    @NotBlank(message = "Patient email is required")
    @Email(message = "Invalid patient email")
    private String patientEmail;

    @NotBlank(message = "Relationship is required")
    private String relationship;

    private String notes;
}

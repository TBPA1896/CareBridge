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
public class CaregiverLinkActionRequest {

    @NotBlank(message = "Action is required (APPROVE, REJECT, REVOKE)")
    private String action; // APPROVE, REJECT, REVOKE

    private String notes;
}

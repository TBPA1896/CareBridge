package com.carebridge.dto.request;

import com.carebridge.model.StructuredInstructions;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DischargeInstructionReviewRequest {

    @NotNull(message = "Structured instructions cannot be null")
    private StructuredInstructions structuredInstructions;

    private String clinicalNotes;

    private boolean approved;
}

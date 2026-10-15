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
public class AlertAcknowledgeRequest {

    @NotBlank(message = "Follow-up action details are required")
    private String followUpAction;
}

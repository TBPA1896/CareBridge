package com.carebridge.dto.request;

import com.carebridge.model.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAdherenceRequest {

    @NotNull(message = "Task status is required")
    private TaskStatus status; // COMPLETED, MISSED, NOT_COMPLETED, LATE_COMPLETED

    private String actualReportedTime; // HH:mm format, e.g. "08:30"

    private String patientNotes;

    private String sideEffects;
}

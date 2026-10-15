package com.carebridge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdherenceSummaryResponse {
    private long totalEvents;
    private long onTimeCount;
    private long delayedCount;
    private long missedCount;
    private long skippedCount;
    private double adherencePercentage;
}

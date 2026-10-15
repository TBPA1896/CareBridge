package com.carebridge.dto.response;

import com.carebridge.model.RecoveryTask;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodayTasksResponse {
    private LocalDate date;
    private int totalCount;
    private int completedCount;
    private int pendingCount;
    private int missedCount;
    private double adherencePercentage;
    @Builder.Default
    private List<RecoveryTask> tasks = new ArrayList<>();
}

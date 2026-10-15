package com.carebridge.controller;

import com.carebridge.dto.request.PatientConcernRequest;
import com.carebridge.dto.request.TaskAdherenceRequest;
import com.carebridge.dto.response.TodayTasksResponse;
import com.carebridge.model.RecoveryTask;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.RecoveryTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recovery-tasks")
@RequiredArgsConstructor
public class RecoveryTaskController {

    private final RecoveryTaskService taskService;

    @GetMapping("/today")
    public ResponseEntity<TodayTasksResponse> getTodayTasks(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String targetPatientId = (patientId != null && !patientId.isBlank()) ? patientId : userPrincipal.getId();
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        return ResponseEntity.ok(taskService.getTodayTasks(targetPatientId, targetDate, userPrincipal));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<RecoveryTask> getTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(taskService.getTask(taskId, userPrincipal));
    }

    @GetMapping("/plan/{planId}")
    public ResponseEntity<List<RecoveryTask>> getTasksByPlan(@PathVariable String planId) {
        return ResponseEntity.ok(taskService.getTasksByPlan(planId));
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<RecoveryTask> updateTaskStatus(
            @PathVariable String taskId,
            @Valid @RequestBody TaskAdherenceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(taskService.recordAdherence(taskId, request, userPrincipal));
    }

    @PostMapping("/{taskId}/adherence-events")
    public ResponseEntity<RecoveryTask> recordAdherenceEvent(
            @PathVariable String taskId,
            @Valid @RequestBody TaskAdherenceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(taskService.recordAdherence(taskId, request, userPrincipal));
    }

    @PostMapping("/concerns")
    public ResponseEntity<?> reportConcern(
            @RequestParam(required = false) String patientId,
            @Valid @RequestBody PatientConcernRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String targetPatientId = (patientId != null && !patientId.isBlank()) ? patientId : userPrincipal.getId();
        taskService.reportConcern(targetPatientId, request, userPrincipal);
        return ResponseEntity.ok(Map.of("message", "Concern reported successfully and caregivers notified."));
    }
}

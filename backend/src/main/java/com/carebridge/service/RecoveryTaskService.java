package com.carebridge.service;

import com.carebridge.dto.request.PatientConcernRequest;
import com.carebridge.dto.request.TaskAdherenceRequest;
import com.carebridge.dto.response.TodayTasksResponse;
import com.carebridge.exception.BadRequestException;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.RecoveryTask;
import com.carebridge.model.Role;
import com.carebridge.model.TaskStatus;
import com.carebridge.model.User;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.repository.RecoveryTaskRepository;
import com.carebridge.repository.UserRepository;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecoveryTaskService {

    private final RecoveryTaskRepository taskRepository;
    private final AdherenceDeviationEngine deviationEngine;
    private final CaregiverLinkRepository caregiverLinkRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public TodayTasksResponse getTodayTasks(String patientId, LocalDate date, UserPrincipal user) {
        if (date == null) {
            date = LocalDate.now();
        }

        // Authorization check
        if (user.getRole() == Role.PATIENT && !patientId.equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        if (user.getRole() == Role.CAREGIVER) {
            boolean isLinked = caregiverLinkRepository.existsByPatientIdAndCaregiverId(patientId, user.getId());
            if (!isLinked) {
                throw new UnauthorizedException("Caregiver is not authorized to access this patient's tasks.");
            }
        }

        List<RecoveryTask> tasks = taskRepository.findByPatientIdAndScheduledDate(patientId, date);

        int total = tasks.size();
        int completed = (int) tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED || t.getStatus() == TaskStatus.LATE_COMPLETED)
                .count();
        int pending = (int) tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING)
                .count();
        int missed = (int) tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.MISSED)
                .count();

        double adherence = total > 0 ? ((double) completed / total) * 100.0 : 100.0;

        return TodayTasksResponse.builder()
                .date(date)
                .totalCount(total)
                .completedCount(completed)
                .pendingCount(pending)
                .missedCount(missed)
                .adherencePercentage(Math.round(adherence * 10.0) / 10.0)
                .tasks(tasks)
                .build();
    }

    public RecoveryTask getTask(String taskId, UserPrincipal user) {
        RecoveryTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        if (user.getRole() == Role.PATIENT && !task.getPatientId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        return task;
    }

    public List<RecoveryTask> getTasksByPlan(String planId) {
        return taskRepository.findByRecoveryPlanId(planId);
    }

    public RecoveryTask recordAdherence(String taskId, TaskAdherenceRequest request, UserPrincipal user) {
        RecoveryTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        // Patients can log their tasks. Caregivers can assist if linked.
        boolean isPatient = task.getPatientId().equals(user.getId());
        boolean isCaregiver = user.getRole() == Role.CAREGIVER &&
                caregiverLinkRepository.existsByPatientIdAndCaregiverId(task.getPatientId(), user.getId());

        if (!isPatient && !isCaregiver && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to record adherence for this task.");
        }

        if (request.getStatus() == null) {
            throw new BadRequestException("Task completion status is required.");
        }

        task.setStatus(request.getStatus());
        task.setActualReportedTime(request.getActualReportedTime());
        task.setReportedNotes(request.getPatientNotes());
        task.setCompletedAt(Instant.now());
        RecoveryTask updatedTask = taskRepository.save(task);

        // Process through Adherence & Deviation Engine
        deviationEngine.processTaskAdherence(
                updatedTask,
                request.getStatus(),
                request.getActualReportedTime(),
                request.getPatientNotes(),
                request.getSideEffects()
        );

        auditLogService.logAction(user.getId(), user.getEmail(), user.getRole().name(),
                "RECORD_ADHERENCE", "RecoveryTask", task.getId(),
                "Recorded status " + request.getStatus() + " for task: " + task.getTitle());

        return updatedTask;
    }

    public void reportConcern(String patientId, PatientConcernRequest request, UserPrincipal user) {
        if (user.getRole() == Role.PATIENT && !patientId.equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }

        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        RecoveryTask task = null;
        if (request.getTaskId() != null && !request.getTaskId().isBlank()) {
            task = taskRepository.findById(request.getTaskId()).orElse(null);
        }

        String planId = task != null ? task.getRecoveryPlanId() : null;
        String taskTitle = task != null ? task.getTitle() : "Patient Reported Concern";

        String details = request.getTitle() + " - " + request.getDescription();
        if (request.getSideEffects() != null && !request.getSideEffects().isBlank()) {
            details += " [Side Effects: " + request.getSideEffects() + "]";
        }

        deviationEngine.createPatientConcernAlert(
                patientId,
                patient.getFullName(),
                planId,
                task != null ? task.getId() : null,
                taskTitle,
                details
        );

        auditLogService.logAction(user.getId(), user.getEmail(), user.getRole().name(),
                "REPORT_CONCERN", "PatientConcern", patientId, details);
    }
}

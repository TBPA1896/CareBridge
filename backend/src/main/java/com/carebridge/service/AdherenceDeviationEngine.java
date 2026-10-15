package com.carebridge.service;

import com.carebridge.model.*;
import com.carebridge.repository.AdherenceEventRepository;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.repository.DeviationAlertRepository;
import com.carebridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdherenceDeviationEngine {

    private final AdherenceEventRepository adherenceRepository;
    private final DeviationAlertRepository alertRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Thresholds (in minutes)
    public static final long LATE_THRESHOLD_MINUTES = 60;
    public static final long SEVERE_LATE_THRESHOLD_MINUTES = 180;
    public static final int REPEATED_DEVIATION_HOURS_WINDOW = 48;
    public static final int REPEATED_DEVIATION_THRESHOLD_COUNT = 2;

    /**
     * Evaluates a reported task adherence event, calculates temporal deviations,
     * checks for missed tasks and repeated deviation patterns, and generates alerts for authorized caregivers.
     */
    public AdherenceEvent processTaskAdherence(RecoveryTask task,
                                              TaskStatus reportedStatus,
                                              String reportedActualTime,
                                              String patientNotes,
                                              String sideEffects) {
        LocalDateTime scheduledDateTime = task.getScheduledDate().atTime(
                task.getScheduledTime() != null ? LocalTime.parse(task.getScheduledTime()) : LocalTime.of(8, 0)
        );

        LocalDateTime actualDateTime;
        long deviationMinutes = 0;
        AdherenceStatus eventStatus = AdherenceStatus.ON_TIME;

        if (reportedStatus == TaskStatus.MISSED) {
            actualDateTime = LocalDateTime.now();
            eventStatus = AdherenceStatus.MISSED;
        } else if (reportedActualTime != null && !reportedActualTime.isBlank()) {
            actualDateTime = task.getScheduledDate().atTime(LocalTime.parse(reportedActualTime));
            deviationMinutes = Duration.between(scheduledDateTime, actualDateTime).toMinutes();

            if (deviationMinutes >= LATE_THRESHOLD_MINUTES) {
                eventStatus = AdherenceStatus.DELAYED;
            } else {
                eventStatus = AdherenceStatus.ON_TIME;
            }
        } else {
            actualDateTime = LocalDateTime.now();
            deviationMinutes = Duration.between(scheduledDateTime, actualDateTime).toMinutes();
            if (deviationMinutes >= LATE_THRESHOLD_MINUTES) {
                eventStatus = AdherenceStatus.DELAYED;
            }
        }

        // 1. Persist Adherence Event
        AdherenceEvent event = AdherenceEvent.builder()
                .taskId(task.getId())
                .patientId(task.getPatientId())
                .recoveryPlanId(task.getRecoveryPlanId())
                .taskTitle(task.getTitle())
                .category(task.getCategory())
                .scheduledDateTime(scheduledDateTime)
                .actualReportedDateTime(actualDateTime)
                .deviationMinutes(deviationMinutes)
                .status(eventStatus)
                .patientNotes(patientNotes)
                .sideEffects(sideEffects)
                .reportedAt(Instant.now())
                .build();
        AdherenceEvent savedEvent = adherenceRepository.save(event);

        // 2. Fetch Patient Name for alerts
        String patientName = userRepository.findById(task.getPatientId())
                .map(User::getFullName)
                .orElse("Patient");

        // 3. Evaluate Lateness Deviation Alert
        if (eventStatus == AdherenceStatus.DELAYED) {
            evaluateLateTaskAlert(task, patientName, deviationMinutes, patientNotes);
        }

        // 4. Evaluate Missed Task Alert
        if (eventStatus == AdherenceStatus.MISSED) {
            evaluateMissedTaskAlert(task, patientName, patientNotes);
        }

        // 5. Check Repeated Deviations within trailing 48-hour window
        checkRepeatedDeviations(task.getPatientId(), patientName, task.getRecoveryPlanId());

        // 6. Handle Urgent Patient Concerns or Reported Side Effects
        if (sideEffects != null && !sideEffects.isBlank()) {
            createPatientConcernAlert(task.getPatientId(), patientName, task.getRecoveryPlanId(),
                    task.getId(), task.getTitle(), "Patient reported side effect: " + sideEffects);
        }

        return savedEvent;
    }

    private void evaluateLateTaskAlert(RecoveryTask task, String patientName, long deviationMinutes, String notes) {
        AlertType alertType = AlertType.LATE_MEDICATION;
        AlertSeverity severity = deviationMinutes >= SEVERE_LATE_THRESHOLD_MINUTES ? AlertSeverity.HIGH : AlertSeverity.MEDIUM;

        // Deduplication: Avoid duplicate unacknowledged alerts for same task
        Optional<DeviationAlert> existing = alertRepository.findByTaskIdAndAlertTypeAndIsAcknowledgedFalse(task.getId(), alertType);
        if (existing.isPresent()) {
            log.debug("Unacknowledged late alert already exists for task id: {}", task.getId());
            return;
        }

        String hours = String.format("%.1f", deviationMinutes / 60.0);
        String message = String.format("%s was taken %d minutes late (%s hours deviation) by %s.",
                task.getTitle(), deviationMinutes, hours, patientName);

        createAndBroadcastAlert(task.getPatientId(), patientName, task.getRecoveryPlanId(), task.getId(),
                task.getTitle(), alertType, severity, message, notes, deviationMinutes);
    }

    private void evaluateMissedTaskAlert(RecoveryTask task, String patientName, String notes) {
        AlertType alertType = AlertType.MISSED_MEDICATION;
        AlertSeverity severity = AlertSeverity.HIGH;

        Optional<DeviationAlert> existing = alertRepository.findByTaskIdAndAlertTypeAndIsAcknowledgedFalse(task.getId(), alertType);
        if (existing.isPresent()) {
            return;
        }

        String message = String.format("Patient %s reported a missed task: %s (Scheduled at %s).",
                patientName, task.getTitle(), task.getScheduledTime());

        createAndBroadcastAlert(task.getPatientId(), patientName, task.getRecoveryPlanId(), task.getId(),
                task.getTitle(), alertType, severity, message, notes, 0L);
    }

    /**
     * Checks if the patient has had >= 2 missed or delayed adherence events in the past 48 hours.
     * Triggers a CRITICAL repeated deviation alert if condition is met.
     */
    public void checkRepeatedDeviations(String patientId, String patientName, String recoveryPlanId) {
        Instant trailingWindow = Instant.now().minus(REPEATED_DEVIATION_HOURS_WINDOW, ChronoUnit.HOURS);
        List<AdherenceEvent> recentEvents = adherenceRepository.findByPatientIdAndReportedAtAfterOrderByReportedAtDesc(
                patientId, trailingWindow
        );

        long deviationsCount = recentEvents.stream()
                .filter(e -> e.getStatus() == AdherenceStatus.DELAYED || e.getStatus() == AdherenceStatus.MISSED)
                .count();

        if (deviationsCount >= REPEATED_DEVIATION_THRESHOLD_COUNT) {
            // Deduplicate: check if an unacknowledged repeated deviation alert already exists for this patient
            boolean hasActiveRepeatedAlert = alertRepository.findByPatientIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(patientId)
                    .stream()
                    .anyMatch(a -> a.getAlertType() == AlertType.REPEATED_DEVIATION);

            if (!hasActiveRepeatedAlert) {
                String message = String.format("CRITICAL REPEATED DEVIATION: %s has logged %d missed or delayed recovery tasks in the past 48 hours.",
                        patientName, deviationsCount);
                String details = "Pattern of non-adherence detected across multiple doses. Caregiver check-in recommended.";

                createAndBroadcastAlert(patientId, patientName, recoveryPlanId, null,
                        "Repeated Non-Adherence Pattern", AlertType.REPEATED_DEVIATION, AlertSeverity.CRITICAL,
                        message, details, 0L);
            }
        }
    }

    public void createPatientConcernAlert(String patientId, String patientName, String recoveryPlanId,
                                          String taskId, String taskTitle, String concernDetails) {
        String message = String.format("Urgent Recovery Concern from %s: %s", patientName, concernDetails);

        createAndBroadcastAlert(patientId, patientName, recoveryPlanId, taskId,
                taskTitle != null ? taskTitle : "Patient Reported Concern",
                AlertType.PATIENT_CONCERN, AlertSeverity.CRITICAL, message, concernDetails, 0L);
    }

    private void createAndBroadcastAlert(String patientId, String patientName, String recoveryPlanId,
                                         String taskId, String taskTitle, AlertType alertType,
                                         AlertSeverity severity, String message, String details, Long deviationMinutes) {
        DeviationAlert alert = DeviationAlert.builder()
                .patientId(patientId)
                .patientName(patientName)
                .recoveryPlanId(recoveryPlanId)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .alertType(alertType)
                .severity(severity)
                .message(message)
                .details(details)
                .deviationMinutes(deviationMinutes)
                .isAcknowledged(false)
                .createdAt(Instant.now())
                .build();
        DeviationAlert savedAlert = alertRepository.save(alert);
        log.warn("ALERT GENERATED: [Severity: {}] {} (Patient: {})", severity, message, patientId);

        // Find all authorized caregivers who can receive alerts
        List<CaregiverLink> links = caregiverLinkRepository.findByPatientIdAndStatus(patientId, CaregiverLinkStatus.APPROVED);
        for (CaregiverLink link : links) {
            if (link.isCanReceiveAlerts()) {
                notificationService.sendNotification(
                        link.getCaregiverId(),
                        patientId,
                        "CareBridge Alert: " + alertType.name().replace('_', ' '),
                        message,
                        NotificationType.CAREGIVER_ALERT,
                        savedAlert.getId()
                );
            }
        }

        // Also notify patient in-app
        notificationService.sendNotification(
                patientId,
                patientId,
                "Adherence Alert Recorded",
                message,
                NotificationType.DEVIATION_ALERT,
                savedAlert.getId()
        );
    }
}

package com.carebridge.service;

import com.carebridge.dto.response.TimelineEventResponse;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.*;
import com.carebridge.repository.*;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimelineService {

    private final AdherenceEventRepository adherenceRepository;
    private final DeviationAlertRepository alertRepository;
    private final RecoveryPlanRepository planRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;

    public List<TimelineEventResponse> getPatientTimeline(String patientId, UserPrincipal user) {
        // Enforce authorization
        if (user.getRole() == Role.PATIENT && !patientId.equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        if (user.getRole() == Role.CAREGIVER) {
            boolean isLinked = caregiverLinkRepository.existsByPatientIdAndCaregiverId(patientId, user.getId());
            if (!isLinked) {
                throw new UnauthorizedException("Caregiver is not authorized to view this patient's timeline.");
            }
        }

        List<TimelineEventResponse> events = new ArrayList<>();

        // 1. Recovery Plans activations
        List<RecoveryPlan> plans = planRepository.findByPatientId(patientId);
        for (RecoveryPlan plan : plans) {
            if (plan.getActivatedAt() != null) {
                events.add(TimelineEventResponse.builder()
                        .id("plan-" + plan.getId())
                        .eventType("PLAN_ACTIVATED")
                        .timestamp(plan.getActivatedAt())
                        .title("Recovery Plan Activated: " + plan.getTitle())
                        .description("Duration: " + plan.getDurationDays() + " days. Diagnosis: " + plan.getDiagnosis())
                        .category("RECOVERY_PLAN")
                        .status("ACTIVE")
                        .actor(plan.getVerifiedByName() != null ? plan.getVerifiedByName() : "Clinical Team")
                        .referenceId(plan.getId())
                        .build());
            }
        }

        // 2. Adherence Events (Completed, Late, Missed)
        List<AdherenceEvent> adherenceEvents = adherenceRepository.findByPatientIdOrderByReportedAtDesc(patientId);
        for (AdherenceEvent adh : adherenceEvents) {
            String type = "TASK_COMPLETED";
            String severity = "LOW";
            if (adh.getStatus() == AdherenceStatus.DELAYED) {
                type = "TASK_LATE";
                severity = adh.getDeviationMinutes() >= 180 ? "HIGH" : "MEDIUM";
            } else if (adh.getStatus() == AdherenceStatus.MISSED) {
                type = "TASK_MISSED";
                severity = "HIGH";
            }

            String desc = adh.getStatus() == AdherenceStatus.DELAYED
                    ? "Recorded " + adh.getDeviationMinutes() + " mins late. Notes: " + (adh.getPatientNotes() != null ? adh.getPatientNotes() : "None")
                    : (adh.getPatientNotes() != null ? adh.getPatientNotes() : "Logged on schedule");

            if (adh.getSideEffects() != null && !adh.getSideEffects().isBlank()) {
                desc += " • Reported side effects: " + adh.getSideEffects();
            }

            Instant eventTime = adh.getReportedAt() != null
                    ? adh.getReportedAt()
                    : adh.getActualReportedDateTime().toInstant(ZoneOffset.UTC);

            events.add(TimelineEventResponse.builder()
                    .id("adh-" + adh.getId())
                    .eventType(type)
                    .timestamp(eventTime)
                    .title(adh.getTaskTitle())
                    .description(desc)
                    .category(adh.getCategory() != null ? adh.getCategory().name() : "MEDICATION")
                    .severity(severity)
                    .status(adh.getStatus().name())
                    .actor("Patient")
                    .referenceId(adh.getTaskId())
                    .build());
        }

        // 3. Alerts and Acknowledgements
        List<DeviationAlert> alerts = alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        for (DeviationAlert alert : alerts) {
            events.add(TimelineEventResponse.builder()
                    .id("alert-" + alert.getId())
                    .eventType("ALERT_TRIGGERED")
                    .timestamp(alert.getCreatedAt())
                    .title("Alert: " + alert.getAlertType().name().replace('_', ' '))
                    .description(alert.getMessage())
                    .category("ALERT")
                    .severity(alert.getSeverity().name())
                    .status(alert.isAcknowledged() ? "ACKNOWLEDGED" : "PENDING")
                    .actor("System")
                    .referenceId(alert.getId())
                    .build());

            if (alert.isAcknowledged() && alert.getAcknowledgedAt() != null) {
                events.add(TimelineEventResponse.builder()
                        .id("ack-" + alert.getId())
                        .eventType("ALERT_ACKNOWLEDGED")
                        .timestamp(alert.getAcknowledgedAt())
                        .title("Alert Follow-Up: " + alert.getTaskTitle())
                        .description("Caregiver action: " + alert.getFollowUpAction())
                        .category("CAREGIVER_ACTION")
                        .severity("LOW")
                        .status("RESOLVED")
                        .actor(alert.getAcknowledgedByName() != null ? alert.getAcknowledgedByName() : "Caregiver")
                        .referenceId(alert.getId())
                        .build());
            }
        }

        // Sort entire timeline descending (most recent first)
        events.sort(Comparator.comparing(TimelineEventResponse::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));
        return events;
    }
}

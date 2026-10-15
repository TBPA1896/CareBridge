package com.carebridge.service;

import com.carebridge.dto.request.AlertAcknowledgeRequest;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.*;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.repository.DeviationAlertRepository;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviationAlertService {

    private final DeviationAlertRepository alertRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public List<DeviationAlert> getAlertsForCaregiver(String caregiverId) {
        List<CaregiverLink> links = caregiverLinkRepository.findByCaregiverIdAndStatus(caregiverId, CaregiverLinkStatus.APPROVED);
        List<DeviationAlert> allAlerts = new ArrayList<>();

        for (CaregiverLink link : links) {
            allAlerts.addAll(alertRepository.findByPatientIdOrderByCreatedAtDesc(link.getPatientId()));
        }

        // Sort descending by created time
        allAlerts.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return allAlerts;
    }

    public List<DeviationAlert> getAlertsForPatient(String patientId, UserPrincipal user) {
        if (user.getRole() == Role.PATIENT && !patientId.equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        return alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<DeviationAlert> getAllAlerts(UserPrincipal admin) {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    public DeviationAlert acknowledgeAlert(String alertId, AlertAcknowledgeRequest request, UserPrincipal user) {
        DeviationAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + alertId));

        // Caregiver must have approved link with patient, or user must be Admin/Clinician
        if (user.getRole() == Role.CAREGIVER) {
            boolean isLinked = caregiverLinkRepository.existsByPatientIdAndCaregiverId(alert.getPatientId(), user.getId());
            if (!isLinked) {
                throw new UnauthorizedException("Caregiver is not authorized to acknowledge alerts for this patient.");
            }
        }

        alert.setAcknowledged(true);
        alert.setAcknowledgedByUserId(user.getId());
        alert.setAcknowledgedByName(user.getFullName());
        alert.setAcknowledgedAt(Instant.now());
        alert.setFollowUpAction(request.getFollowUpAction());

        DeviationAlert updated = alertRepository.save(alert);

        // Notify patient that their caregiver reviewed and followed up
        notificationService.sendNotification(
                alert.getPatientId(),
                alert.getPatientId(),
                "Caregiver Follow-Up Recorded",
                user.getFullName() + " acknowledged your alert: " + request.getFollowUpAction(),
                NotificationType.ALERT_ACKNOWLEDGED,
                alert.getId()
        );

        auditLogService.logAction(user.getId(), user.getEmail(), user.getRole().name(),
                "ACKNOWLEDGE_ALERT", "DeviationAlert", alert.getId(),
                "Follow up: " + request.getFollowUpAction());

        return updated;
    }
}

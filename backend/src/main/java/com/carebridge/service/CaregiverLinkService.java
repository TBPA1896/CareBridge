package com.carebridge.service;

import com.carebridge.dto.request.CaregiverLinkActionRequest;
import com.carebridge.dto.request.CaregiverLinkRequest;
import com.carebridge.dto.response.CaregiverPatientSummaryResponse;
import com.carebridge.exception.BadRequestException;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.*;
import com.carebridge.repository.*;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaregiverLinkService {

    private final CaregiverLinkRepository caregiverLinkRepository;
    private final UserRepository userRepository;
    private final RecoveryPlanRepository planRepository;
    private final RecoveryTaskRepository taskRepository;
    private final DeviationAlertRepository alertRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public CaregiverLink requestLink(UserPrincipal caregiverPrincipal, CaregiverLinkRequest request) {
        String patientEmail = request.getPatientEmail().toLowerCase().trim();

        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with email: " + patientEmail));

        if (patient.getRole() != Role.PATIENT) {
            throw new BadRequestException("The requested user is not registered as a patient.");
        }

        if (patient.getId().equals(caregiverPrincipal.getId())) {
            throw new BadRequestException("You cannot link your own account as a caregiver.");
        }

        if (caregiverLinkRepository.existsByPatientIdAndCaregiverId(patient.getId(), caregiverPrincipal.getId())) {
            throw new BadRequestException("A connection link or request already exists for this patient.");
        }

        CaregiverLink link = CaregiverLink.builder()
                .caregiverId(caregiverPrincipal.getId())
                .caregiverName(caregiverPrincipal.getFullName())
                .caregiverEmail(caregiverPrincipal.getEmail())
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .patientEmail(patient.getEmail())
                .relationship(request.getRelationship())
                .notes(request.getNotes())
                .status(CaregiverLinkStatus.PENDING)
                .canReceiveAlerts(true)
                .requestedAt(Instant.now())
                .build();
        CaregiverLink savedLink = caregiverLinkRepository.save(link);

        // Notify patient in-app
        notificationService.sendNotification(
                patient.getId(),
                patient.getId(),
                "New Caregiver Connection Request",
                caregiverPrincipal.getFullName() + " has requested caregiver access to your recovery updates.",
                NotificationType.CAREGIVER_REQUEST,
                savedLink.getId()
        );

        auditLogService.logAction(caregiverPrincipal.getId(), caregiverPrincipal.getEmail(), "CAREGIVER",
                "REQUEST_LINK", "CaregiverLink", savedLink.getId(), "Caregiver requested link with " + patientEmail);

        return savedLink;
    }

    public List<CaregiverLink> getLinksForPatient(String patientId) {
        return caregiverLinkRepository.findByPatientId(patientId);
    }

    public List<CaregiverLink> getLinksForCaregiver(String caregiverId) {
        return caregiverLinkRepository.findByCaregiverId(caregiverId);
    }

    public CaregiverLink handleLinkAction(String linkId, UserPrincipal userPrincipal, CaregiverLinkActionRequest request) {
        CaregiverLink link = caregiverLinkRepository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException("Caregiver link not found: " + linkId));

        // Enforce access: Patient owns the link approval/revocation; Admin can also manage
        boolean isPatient = link.getPatientId().equals(userPrincipal.getId());
        boolean isAdmin = userPrincipal.getRole() == Role.ADMIN;
        boolean isCaregiverRevoking = link.getCaregiverId().equals(userPrincipal.getId()) && "REVOKE".equalsIgnoreCase(request.getAction());

        if (!isPatient && !isAdmin && !isCaregiverRevoking) {
            throw new UnauthorizedException("You are not authorized to modify this caregiver link.");
        }

        String action = request.getAction().toUpperCase().trim();
        CaregiverLinkStatus newStatus;
        switch (action) {
            case "APPROVE":
                newStatus = CaregiverLinkStatus.APPROVED;
                break;
            case "REJECT":
                newStatus = CaregiverLinkStatus.REJECTED;
                break;
            case "REVOKE":
                newStatus = CaregiverLinkStatus.REVOKED;
                break;
            default:
                throw new BadRequestException("Invalid action: " + action + ". Must be APPROVE, REJECT, or REVOKE.");
        }

        link.setStatus(newStatus);
        link.setRespondedAt(Instant.now());
        if (request.getNotes() != null) {
            link.setNotes(request.getNotes());
        }
        CaregiverLink updated = caregiverLinkRepository.save(link);

        // Notify caregiver
        notificationService.sendNotification(
                link.getCaregiverId(),
                link.getPatientId(),
                "Caregiver Request " + newStatus.name(),
                "Your connection request with " + link.getPatientName() + " has been " + newStatus.name().toLowerCase() + ".",
                NotificationType.CAREGIVER_ALERT,
                link.getId()
        );

        auditLogService.logAction(userPrincipal.getId(), userPrincipal.getEmail(), userPrincipal.getRole().name(),
                "UPDATE_LINK_STATUS", "CaregiverLink", link.getId(), "Status changed to " + newStatus);

        return updated;
    }

    public List<CaregiverPatientSummaryResponse> getConnectedPatients(String caregiverId) {
        List<CaregiverLink> approvedLinks = caregiverLinkRepository.findByCaregiverIdAndStatus(caregiverId, CaregiverLinkStatus.APPROVED);
        List<CaregiverPatientSummaryResponse> list = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (CaregiverLink link : approvedLinks) {
            String patientId = link.getPatientId();
            User patient = userRepository.findById(patientId).orElse(null);
            if (patient == null) continue;

            // Fetch active recovery plan
            RecoveryPlan activePlan = planRepository.findByPatientIdAndStatus(patientId, PlanStatus.ACTIVE)
                    .orElse(null);

            // Fetch today's tasks
            List<RecoveryTask> todayTasks = taskRepository.findByPatientIdAndScheduledDate(patientId, today);
            int total = todayTasks.size();
            int completed = (int) todayTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.COMPLETED || t.getStatus() == TaskStatus.LATE_COMPLETED)
                    .count();

            double adherence = total > 0 ? ((double) completed / total) * 100.0 : 100.0;
            long unacknowledgedAlerts = alertRepository.countByPatientIdAndIsAcknowledgedFalse(patientId);

            list.add(CaregiverPatientSummaryResponse.builder()
                    .linkId(link.getId())
                    .patientId(patientId)
                    .patientName(patient.getFullName())
                    .patientEmail(patient.getEmail())
                    .patientPhone(patient.getPhone())
                    .relationship(link.getRelationship())
                    .activePlanId(activePlan != null ? activePlan.getId() : null)
                    .activePlanTitle(activePlan != null ? activePlan.getTitle() : "No Active Plan")
                    .planStatus(activePlan != null ? activePlan.getStatus() : null)
                    .todayTotalTasks(total)
                    .todayCompletedTasks(completed)
                    .adherencePercentage(Math.round(adherence * 10.0) / 10.0)
                    .unacknowledgedAlertsCount(unacknowledgedAlerts)
                    .build());
        }

        return list;
    }

    public CaregiverPatientSummaryResponse getPatientSummary(String patientId, String caregiverId) {
        // Enforce that caregiver has APPROVED link with patient
        CaregiverLink link = caregiverLinkRepository.findByPatientIdAndCaregiverId(patientId, caregiverId)
                .orElseThrow(() -> new UnauthorizedException("Caregiver is not authorized to access this patient."));

        if (link.getStatus() != CaregiverLinkStatus.APPROVED) {
            throw new UnauthorizedException("Caregiver access to this patient is not currently approved.");
        }

        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        RecoveryPlan activePlan = planRepository.findByPatientIdAndStatus(patientId, PlanStatus.ACTIVE)
                .orElse(null);

        List<RecoveryTask> todayTasks = taskRepository.findByPatientIdAndScheduledDate(patientId, LocalDate.now());
        int total = todayTasks.size();
        int completed = (int) todayTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED || t.getStatus() == TaskStatus.LATE_COMPLETED)
                .count();

        double adherence = total > 0 ? ((double) completed / total) * 100.0 : 100.0;
        long unackAlerts = alertRepository.countByPatientIdAndIsAcknowledgedFalse(patientId);

        return CaregiverPatientSummaryResponse.builder()
                .linkId(link.getId())
                .patientId(patientId)
                .patientName(patient.getFullName())
                .patientEmail(patient.getEmail())
                .patientPhone(patient.getPhone())
                .relationship(link.getRelationship())
                .activePlanId(activePlan != null ? activePlan.getId() : null)
                .activePlanTitle(activePlan != null ? activePlan.getTitle() : "No Active Plan")
                .planStatus(activePlan != null ? activePlan.getStatus() : null)
                .todayTotalTasks(total)
                .todayCompletedTasks(completed)
                .adherencePercentage(Math.round(adherence * 10.0) / 10.0)
                .unacknowledgedAlertsCount(unackAlerts)
                .build();
    }
}

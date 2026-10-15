package com.carebridge.service;

import com.carebridge.dto.request.CreateRecoveryPlanRequest;
import com.carebridge.exception.BadRequestException;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.*;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.repository.DischargeInstructionRepository;
import com.carebridge.repository.PatientProfileRepository;
import com.carebridge.repository.RecoveryPlanRepository;
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
public class RecoveryPlanService {

    private final RecoveryPlanRepository planRepository;
    private final DischargeInstructionRepository instructionRepository;
    private final PatientProfileRepository profileRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;
    private final RecoveryWorkflowEngine workflowEngine;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public RecoveryPlan createPlan(CreateRecoveryPlanRequest request, UserPrincipal creator) {
        DischargeInstruction instruction = instructionRepository.findById(request.getDischargeInstructionId())
                .orElseThrow(() -> new ResourceNotFoundException("Discharge instruction not found: " + request.getDischargeInstructionId()));

        int duration = request.getDurationDays() != null && request.getDurationDays() > 0 ? request.getDurationDays() : 14;
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = startDate.plusDays(duration);

        List<String> warnings = request.getWarningSigns() != null ? request.getWarningSigns() : new ArrayList<>();
        if (warnings.isEmpty() && instruction.getExtractedDraft() != null && instruction.getExtractedDraft().getWarningSigns() != null) {
            warnings = instruction.getExtractedDraft().getWarningSigns().stream()
                    .map(StructuredInstructions.WarningSignItem::getSymptom)
                    .toList();
        }

        String emergency = request.getEmergencyInstructions();
        if (emergency == null && instruction.getExtractedDraft() != null) {
            emergency = instruction.getExtractedDraft().getEmergencyInstructions();
        }

        RecoveryPlan plan = RecoveryPlan.builder()
                .patientId(instruction.getPatientId())
                .patientName(instruction.getPatientName())
                .dischargeInstructionId(instruction.getId())
                .title(request.getTitle())
                .diagnosis(request.getDiagnosis() != null ? request.getDiagnosis() : instruction.getDiagnosis())
                .startDate(startDate)
                .endDate(endDate)
                .durationDays(duration)
                .warningSigns(warnings)
                .emergencyInstructions(emergency)
                .status(instruction.getVerificationStatus() == VerificationStatus.VERIFIED ? PlanStatus.VERIFIED : PlanStatus.DRAFT)
                .verifiedByUserId(instruction.getVerifiedByUserId())
                .verifiedByName(instruction.getVerifiedByName())
                .verifiedAt(instruction.getVerifiedAt())
                .build();

        RecoveryPlan saved = planRepository.save(plan);

        auditLogService.logAction(creator.getId(), creator.getEmail(), creator.getRole().name(),
                "CREATE_RECOVERY_PLAN", "RecoveryPlan", saved.getId(), "Created recovery plan: " + plan.getTitle());

        return saved;
    }

    public RecoveryPlan getPlan(String id, UserPrincipal user) {
        RecoveryPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recovery plan not found: " + id));

        // Patients can only view their own; caregivers if authorized; clinician/admin can view all
        if (user.getRole() == Role.PATIENT && !plan.getPatientId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        if (user.getRole() == Role.CAREGIVER) {
            boolean isLinked = caregiverLinkRepository.existsByPatientIdAndCaregiverId(plan.getPatientId(), user.getId());
            if (!isLinked) {
                throw new UnauthorizedException("Caregiver is not authorized to view this patient's recovery plan.");
            }
        }

        return plan;
    }

    public List<RecoveryPlan> getPatientPlans(String patientId, UserPrincipal user) {
        if (user.getRole() == Role.PATIENT && !patientId.equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        if (user.getRole() == Role.CAREGIVER) {
            boolean isLinked = caregiverLinkRepository.existsByPatientIdAndCaregiverId(patientId, user.getId());
            if (!isLinked) {
                throw new UnauthorizedException("Caregiver is not authorized to view this patient's plans.");
            }
        }
        return planRepository.findByPatientId(patientId);
    }

    public List<RecoveryPlan> getAllPlans() {
        return planRepository.findAll();
    }

    /**
     * Activates a verified recovery plan, triggers the workflow engine to generate day-by-day scheduled tasks,
     * updates patient profile active plan pointer, and broadcasts notifications.
     */
    public RecoveryPlan activatePlan(String id, UserPrincipal user) {
        RecoveryPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recovery plan not found: " + id));

        DischargeInstruction instruction = instructionRepository.findById(plan.getDischargeInstructionId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated discharge instruction not found."));

        // Clinical safety enforcement: Cannot activate an unverified plan
        if (instruction.getVerificationStatus() != VerificationStatus.VERIFIED && plan.getStatus() != PlanStatus.VERIFIED) {
            throw new BadRequestException("Safety Rule Violation: Cannot activate a recovery plan that has not been clinically reviewed and verified by an authorized medical professional.");
        }

        // Deactivate any currently active plan for this patient
        planRepository.findByPatientIdAndStatus(plan.getPatientId(), PlanStatus.ACTIVE).ifPresent(oldActive -> {
            oldActive.setStatus(PlanStatus.COMPLETED);
            planRepository.save(oldActive);
        });

        plan.setStatus(PlanStatus.ACTIVE);
        plan.setActivatedAt(Instant.now());
        RecoveryPlan activated = planRepository.save(plan);

        // Update PatientProfile
        profileRepository.findByUserId(plan.getPatientId()).ifPresent(prof -> {
            prof.setActiveRecoveryPlanId(activated.getId());
            profileRepository.save(prof);
        });

        // Trigger Workflow Engine to generate scheduled tasks
        workflowEngine.generateScheduleForPlan(activated, instruction.getExtractedDraft());

        // Notify patient
        notificationService.sendNotification(
                plan.getPatientId(),
                plan.getPatientId(),
                "Recovery Plan Activated",
                "Your personalized post-discharge recovery plan '" + plan.getTitle() + "' is now active. Daily tasks have been scheduled.",
                NotificationType.PLAN_UPDATED,
                activated.getId()
        );

        // Notify authorized caregivers
        List<CaregiverLink> links = caregiverLinkRepository.findByPatientIdAndStatus(plan.getPatientId(), CaregiverLinkStatus.APPROVED);
        for (CaregiverLink link : links) {
            notificationService.sendNotification(
                    link.getCaregiverId(),
                    plan.getPatientId(),
                    "Patient Recovery Plan Active",
                    plan.getPatientName() + "'s recovery plan has been activated.",
                    NotificationType.PLAN_UPDATED,
                    activated.getId()
            );
        }

        auditLogService.logAction(user.getId(), user.getEmail(), user.getRole().name(),
                "ACTIVATE_PLAN", "RecoveryPlan", activated.getId(), "Activated plan and generated daily schedules");

        return activated;
    }
}

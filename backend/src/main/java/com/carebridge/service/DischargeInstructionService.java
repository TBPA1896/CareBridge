package com.carebridge.service;

import com.carebridge.dto.request.DischargeInstructionCreateRequest;
import com.carebridge.dto.request.DischargeInstructionReviewRequest;
import com.carebridge.exception.BadRequestException;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.*;
import com.carebridge.repository.DischargeInstructionRepository;
import com.carebridge.repository.UserRepository;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DischargeInstructionService {

    private final DischargeInstructionRepository instructionRepository;
    private final UserRepository userRepository;
    private final NlpExtractorService nlpExtractorService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public DischargeInstruction createInstruction(DischargeInstructionCreateRequest request, UserPrincipal creator) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + request.getPatientId()));

        if (patient.getRole() != Role.PATIENT) {
            throw new BadRequestException("Target user is not registered as a patient.");
        }

        // Run NLP extractor immediately to prefill draft
        StructuredInstructions draft = nlpExtractorService.extractStructuredInformation(request.getRawInstructionText());

        DischargeInstruction instruction = DischargeInstruction.builder()
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .hospitalName(request.getHospitalName())
                .attendingPhysician(request.getAttendingPhysician())
                .dischargeDate(request.getDischargeDate())
                .diagnosis(request.getDiagnosis())
                .rawInstructionText(request.getRawInstructionText())
                .uploadedDocumentName(request.getUploadedDocumentName())
                .extractedDraft(draft)
                .verificationStatus(VerificationStatus.EXTRACTED)
                .build();

        DischargeInstruction saved = instructionRepository.save(instruction);

        auditLogService.logAction(creator.getId(), creator.getEmail(), creator.getRole().name(),
                "CREATE_DISCHARGE_INSTRUCTION", "DischargeInstruction", saved.getId(),
                "Instruction created for patient " + patient.getFullName());

        return saved;
    }

    public DischargeInstruction getInstruction(String id, UserPrincipal user) {
        DischargeInstruction instruction = instructionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discharge instruction not found: " + id));

        // Patients can only view their own; Clinicians and Admins can view all
        if (user.getRole() == Role.PATIENT && !instruction.getPatientId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to view this discharge instruction.");
        }

        return instruction;
    }

    public List<DischargeInstruction> getPatientInstructions(String patientId, UserPrincipal user) {
        if (user.getRole() == Role.PATIENT && !patientId.equals(user.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        return instructionRepository.findByPatientId(patientId);
    }

    public List<DischargeInstruction> getAllInstructions(UserPrincipal user) {
        return instructionRepository.findAll();
    }

    public DischargeInstruction runNlpExtraction(String id, UserPrincipal user) {
        DischargeInstruction instruction = instructionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instruction not found: " + id));

        StructuredInstructions extracted = nlpExtractorService.extractStructuredInformation(instruction.getRawInstructionText());
        instruction.setExtractedDraft(extracted);
        instruction.setVerificationStatus(VerificationStatus.EXTRACTED);
        DischargeInstruction updated = instructionRepository.save(instruction);

        auditLogService.logAction(user.getId(), user.getEmail(), user.getRole().name(),
                "NLP_EXTRACT", "DischargeInstruction", id, "Extracted structured recovery draft");

        return updated;
    }

    public DischargeInstruction reviewAndVerify(String id, DischargeInstructionReviewRequest request, UserPrincipal reviewer) {
        // Clinical safety check: only CLINICIAN or ADMIN can review and verify
        if (reviewer.getRole() != Role.CLINICIAN && reviewer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only licensed medical staff or clinical administrators can review discharge instructions.");
        }

        DischargeInstruction instruction = instructionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instruction not found: " + id));

        instruction.setExtractedDraft(request.getStructuredInstructions());
        instruction.setClinicalNotes(request.getClinicalNotes());
        instruction.setVerifiedByUserId(reviewer.getId());
        instruction.setVerifiedByName(reviewer.getFullName());
        instruction.setVerifiedAt(Instant.now());
        instruction.setVerificationStatus(request.isApproved() ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED);

        DischargeInstruction updated = instructionRepository.save(instruction);

        if (request.isApproved()) {
            notificationService.sendNotification(
                    instruction.getPatientId(),
                    instruction.getPatientId(),
                    "Discharge Instructions Verified",
                    "Your discharge instructions have been clinically reviewed and verified by " + reviewer.getFullName() + ".",
                    NotificationType.PLAN_UPDATED,
                    instruction.getId()
            );
        }

        auditLogService.logAction(reviewer.getId(), reviewer.getEmail(), reviewer.getRole().name(),
                "VERIFY_DISCHARGE_INSTRUCTION", "DischargeInstruction", id,
                "Verification result: " + instruction.getVerificationStatus());

        return updated;
    }
}

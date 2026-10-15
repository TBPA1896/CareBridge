package com.carebridge.controller;

import com.carebridge.dto.request.DischargeInstructionCreateRequest;
import com.carebridge.dto.request.DischargeInstructionReviewRequest;
import com.carebridge.model.DischargeInstruction;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.DischargeInstructionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discharge-instructions")
@RequiredArgsConstructor
public class DischargeInstructionController {

    private final DischargeInstructionService instructionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<DischargeInstruction> createInstruction(
            @Valid @RequestBody DischargeInstructionCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(instructionService.createInstruction(request, userPrincipal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DischargeInstruction> getInstruction(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(instructionService.getInstruction(id, userPrincipal));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DischargeInstruction>> getPatientInstructions(
            @PathVariable String patientId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(instructionService.getPatientInstructions(patientId, userPrincipal));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<List<DischargeInstruction>> getAllInstructions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(instructionService.getAllInstructions(userPrincipal));
    }

    @PostMapping("/{id}/extract")
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<DischargeInstruction> extractStructuredData(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(instructionService.runNlpExtraction(id, userPrincipal));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<DischargeInstruction> reviewAndVerify(
            @PathVariable String id,
            @Valid @RequestBody DischargeInstructionReviewRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(instructionService.reviewAndVerify(id, request, userPrincipal));
    }
}

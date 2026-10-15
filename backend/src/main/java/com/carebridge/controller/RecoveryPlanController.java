package com.carebridge.controller;

import com.carebridge.dto.request.CreateRecoveryPlanRequest;
import com.carebridge.model.RecoveryPlan;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.RecoveryPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recovery-plans")
@RequiredArgsConstructor
public class RecoveryPlanController {

    private final RecoveryPlanService planService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<RecoveryPlan> createPlan(@Valid @RequestBody CreateRecoveryPlanRequest request,
                                                  @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(planService.createPlan(request, userPrincipal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecoveryPlan> getPlan(@PathVariable String id,
                                                @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(planService.getPlan(id, userPrincipal));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RecoveryPlan>> getPatientPlans(@PathVariable String patientId,
                                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(planService.getPatientPlans(patientId, userPrincipal));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<List<RecoveryPlan>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<RecoveryPlan> activatePlan(@PathVariable String id,
                                                     @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(planService.activatePlan(id, userPrincipal));
    }
}

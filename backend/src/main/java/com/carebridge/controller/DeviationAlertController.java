package com.carebridge.controller;

import com.carebridge.dto.request.AlertAcknowledgeRequest;
import com.carebridge.model.DeviationAlert;
import com.carebridge.model.Role;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.DeviationAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class DeviationAlertController {

    private final DeviationAlertService alertService;

    @GetMapping
    public ResponseEntity<List<DeviationAlert>> getAlerts(
            @RequestParam(required = false) String patientId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal.getRole() == Role.CAREGIVER) {
            return ResponseEntity.ok(alertService.getAlertsForCaregiver(userPrincipal.getId()));
        } else if (userPrincipal.getRole() == Role.PATIENT) {
            return ResponseEntity.ok(alertService.getAlertsForPatient(userPrincipal.getId(), userPrincipal));
        } else {
            if (patientId != null && !patientId.isBlank()) {
                return ResponseEntity.ok(alertService.getAlertsForPatient(patientId, userPrincipal));
            }
            return ResponseEntity.ok(alertService.getAllAlerts(userPrincipal));
        }
    }

    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<DeviationAlert> acknowledgeAlert(
            @PathVariable String alertId,
            @Valid @RequestBody AlertAcknowledgeRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(alertId, request, userPrincipal));
    }
}

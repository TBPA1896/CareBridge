package com.carebridge.controller;

import com.carebridge.dto.request.CaregiverLinkActionRequest;
import com.carebridge.dto.request.CaregiverLinkRequest;
import com.carebridge.dto.response.CaregiverPatientSummaryResponse;
import com.carebridge.model.CaregiverLink;
import com.carebridge.model.Role;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.CaregiverLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CaregiverLinkController {

    private final CaregiverLinkService linkService;

    @PostMapping("/caregiver-links/request")
    @PreAuthorize("hasRole('CAREGIVER')")
    public ResponseEntity<CaregiverLink> requestLink(@AuthenticationPrincipal UserPrincipal caregiverPrincipal,
                                                     @Valid @RequestBody CaregiverLinkRequest request) {
        return ResponseEntity.ok(linkService.requestLink(caregiverPrincipal, request));
    }

    @GetMapping("/caregiver-links")
    public ResponseEntity<List<CaregiverLink>> getMyLinks(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal.getRole() == Role.CAREGIVER) {
            return ResponseEntity.ok(linkService.getLinksForCaregiver(userPrincipal.getId()));
        } else {
            return ResponseEntity.ok(linkService.getLinksForPatient(userPrincipal.getId()));
        }
    }

    @PutMapping("/caregiver-links/{linkId}/action")
    public ResponseEntity<CaregiverLink> handleLinkAction(@PathVariable String linkId,
                                                          @AuthenticationPrincipal UserPrincipal userPrincipal,
                                                          @Valid @RequestBody CaregiverLinkActionRequest request) {
        return ResponseEntity.ok(linkService.handleLinkAction(linkId, userPrincipal, request));
    }

    @GetMapping("/caregiver/patients")
    @PreAuthorize("hasRole('CAREGIVER')")
    public ResponseEntity<List<CaregiverPatientSummaryResponse>> getConnectedPatients(
            @AuthenticationPrincipal UserPrincipal caregiverPrincipal) {
        return ResponseEntity.ok(linkService.getConnectedPatients(caregiverPrincipal.getId()));
    }

    @GetMapping("/caregiver/patients/{patientId}/summary")
    @PreAuthorize("hasAnyRole('CAREGIVER', 'ADMIN')")
    public ResponseEntity<CaregiverPatientSummaryResponse> getPatientSummary(
            @PathVariable String patientId,
            @AuthenticationPrincipal UserPrincipal caregiverPrincipal) {
        return ResponseEntity.ok(linkService.getPatientSummary(patientId, caregiverPrincipal.getId()));
    }
}

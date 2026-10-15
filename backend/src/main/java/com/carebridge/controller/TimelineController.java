package com.carebridge.controller;

import com.carebridge.dto.response.TimelineEventResponse;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.TimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TimelineEventResponse>> getPatientTimeline(
            @PathVariable String patientId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getPatientTimeline(patientId, userPrincipal));
    }
}

package com.carebridge.controller;

import com.carebridge.dto.response.AuthResponse;
import com.carebridge.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("local")
@RestController
@RequestMapping("/api/auth/demo")
@RequiredArgsConstructor
public class DemoAuthController {

    private final AuthService authService;

    @PostMapping("/clinician")
    public ResponseEntity<AuthResponse> clinicianDemoLogin() {
        return ResponseEntity.ok(authService.demoClinicianLogin());
    }
}

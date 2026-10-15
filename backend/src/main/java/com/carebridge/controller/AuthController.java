package com.carebridge.controller;

import com.carebridge.dto.request.ChangePasswordRequest;
import com.carebridge.dto.request.LoginRequest;
import com.carebridge.dto.request.RegisterRequest;
import com.carebridge.dto.response.AuthResponse;
import com.carebridge.dto.response.UserProfileResponse;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Stateless JWT logout is handled client-side by clearing token
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}

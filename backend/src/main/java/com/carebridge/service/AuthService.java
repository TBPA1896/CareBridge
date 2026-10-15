package com.carebridge.service;

import com.carebridge.dto.request.ChangePasswordRequest;
import com.carebridge.dto.request.LoginRequest;
import com.carebridge.dto.request.RegisterRequest;
import com.carebridge.dto.response.AuthResponse;
import com.carebridge.dto.response.UserProfileResponse;
import com.carebridge.exception.BadRequestException;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.*;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.repository.PatientProfileRepository;
import com.carebridge.repository.UserRepository;
import com.carebridge.security.JwtTokenProvider;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientProfileRepository profileRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " already exists.");
        }

        // Restrict public registration of ADMIN role
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Administrator accounts cannot be created via public registration.");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(request.getRole())
                .phone(request.getPhone())
                .status(UserStatus.ACTIVE)
                .build();
        User savedUser = userRepository.save(user);

        // If patient, create initial patient profile
        if (savedUser.getRole() == Role.PATIENT) {
            LocalDate dob = null;
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                try {
                    dob = LocalDate.parse(request.getDateOfBirth());
                } catch (Exception ignored) {}
            }

            PatientProfile profile = PatientProfile.builder()
                    .userId(savedUser.getId())
                    .dateOfBirth(dob)
                    .gender(request.getGender())
                    .bloodGroup(request.getBloodGroup())
                    .emergencyContactName(request.getEmergencyContactName())
                    .emergencyContactPhone(request.getEmergencyContactPhone())
                    .build();
            profileRepository.save(profile);
        }

        // If caregiver registered and provided patient email to connect
        if (savedUser.getRole() == Role.CAREGIVER && request.getPatientEmailToLink() != null && !request.getPatientEmailToLink().isBlank()) {
            Optional<User> patientOpt = userRepository.findByEmail(request.getPatientEmailToLink().toLowerCase().trim());
            patientOpt.ifPresent(patient -> {
                CaregiverLink link = CaregiverLink.builder()
                        .caregiverId(savedUser.getId())
                        .caregiverName(savedUser.getFullName())
                        .caregiverEmail(savedUser.getEmail())
                        .patientId(patient.getId())
                        .patientName(patient.getFullName())
                        .patientEmail(patient.getEmail())
                        .relationship(request.getRelationship() != null ? request.getRelationship() : "Family Member")
                        .status(CaregiverLinkStatus.PENDING)
                        .canReceiveAlerts(true)
                        .requestedAt(Instant.now())
                        .build();
                caregiverLinkRepository.save(link);
            });
        }

        auditLogService.logAction(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name(),
                "REGISTER", "User", savedUser.getId(), "User registered successfully");

        String token = tokenProvider.generateTokenFromUser(
                savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("This account has been suspended. Please contact system administrator.");
        }

        auditLogService.logAction(user.getId(), user.getEmail(), user.getRole().name(),
                "LOGIN", "User", user.getId(), "User logged in successfully");

        return createAuthResponse(user);
    }

    public AuthResponse demoClinicianLogin() {
        if (!seedEnabled) {
            throw new UnauthorizedException("Local demo sign-in is not enabled.");
        }

        User clinician = userRepository.findByEmail("dr.sharma@carebridge.health")
                .filter(user -> user.getRole() == Role.CLINICIAN)
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(() -> new UnauthorizedException("The local demo clinician account is unavailable."));

        auditLogService.logAction(clinician.getId(), clinician.getEmail(), clinician.getRole().name(),
                "DEMO_LOGIN", "User", clinician.getId(), "Local clinician demo sign-in");

        return createAuthResponse(clinician);
    }

    private AuthResponse createAuthResponse(User user) {
        String token = tokenProvider.generateTokenFromUser(
                user.getId(), user.getEmail(), user.getFullName(), user.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    public UserProfileResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getId()));

        PatientProfile profile = null;
        if (user.getRole() == Role.PATIENT) {
            profile = profileRepository.findByUserId(user.getId()).orElse(null);
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .status(user.getStatus())
                .profile(profile)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public void changePassword(UserPrincipal principal, ChangePasswordRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logAction(user.getId(), user.getEmail(), user.getRole().name(),
                "CHANGE_PASSWORD", "User", user.getId(), "Password updated successfully");
    }
}

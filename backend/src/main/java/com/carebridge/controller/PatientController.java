package com.carebridge.controller;

import com.carebridge.dto.request.UpdatePatientProfileRequest;
import com.carebridge.dto.response.UserProfileResponse;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.PatientProfile;
import com.carebridge.model.Role;
import com.carebridge.model.User;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.repository.PatientProfileRepository;
import com.carebridge.repository.UserRepository;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final UserRepository userRepository;
    private final PatientProfileRepository profileRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PatientProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        return ResponseEntity.ok(UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .status(user.getStatus())
                .profile(profile)
                .createdAt(user.getCreatedAt())
                .build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                               @RequestBody UpdatePatientProfileRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);

        PatientProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(PatientProfile.builder().userId(user.getId()).build());

        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getBloodGroup() != null) profile.setBloodGroup(request.getBloodGroup());
        if (request.getEmergencyContactName() != null) profile.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getAllergies() != null) profile.setAllergies(request.getAllergies());
        if (request.getMedicalConditions() != null) profile.setMedicalConditions(request.getMedicalConditions());

        PatientProfile savedProfile = profileRepository.save(profile);

        return ResponseEntity.ok(UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .status(user.getStatus())
                .profile(savedProfile)
                .createdAt(user.getCreatedAt())
                .build());
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<UserProfileResponse> getPatientById(@PathVariable String patientId,
                                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // Enforce ownership or authorization
        if (userPrincipal.getRole() == Role.PATIENT && !patientId.equals(userPrincipal.getId())) {
            throw new UnauthorizedException("Access denied.");
        }
        if (userPrincipal.getRole() == Role.CAREGIVER) {
            boolean isLinked = caregiverLinkRepository.existsByPatientIdAndCaregiverId(patientId, userPrincipal.getId());
            if (!isLinked) {
                throw new UnauthorizedException("Caregiver is not authorized to access this patient.");
            }
        }

        User user = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
        PatientProfile profile = profileRepository.findByUserId(patientId).orElse(null);

        return ResponseEntity.ok(UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .status(user.getStatus())
                .profile(profile)
                .createdAt(user.getCreatedAt())
                .build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<List<User>> getAllPatients() {
        return ResponseEntity.ok(userRepository.findByRole(Role.PATIENT));
    }
}

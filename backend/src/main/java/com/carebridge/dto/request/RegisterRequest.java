package com.carebridge.dto.request;

import com.carebridge.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Role is required")
    private Role role; // PATIENT, CAREGIVER (CLINICIAN only via controlled setup or admin)

    private String phone;

    // Optional patient-specific fields during registration
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String emergencyContactName;
    private String emergencyContactPhone;

    // Optional caregiver-specific fields
    private String patientEmailToLink;
    private String relationship;
}

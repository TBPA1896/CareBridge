package com.carebridge.dto.response;

import com.carebridge.model.PatientProfile;
import com.carebridge.model.Role;
import com.carebridge.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String email;
    private String fullName;
    private Role role;
    private String phone;
    private UserStatus status;
    private PatientProfile profile;
    private Instant createdAt;
}

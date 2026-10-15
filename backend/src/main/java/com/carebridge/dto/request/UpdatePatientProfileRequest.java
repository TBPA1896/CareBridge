package com.carebridge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientProfileRequest {

    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private List<String> allergies;
    private List<String> medicalConditions;
}

package com.carebridge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructuredInstructions {

    @Builder.Default
    private List<MedicationItem> medications = new ArrayList<>();

    @Builder.Default
    private List<WoundCareItem> woundCareTasks = new ArrayList<>();

    @Builder.Default
    private List<DietItem> dietInstructions = new ArrayList<>();

    @Builder.Default
    private List<ActivityItem> activityRestrictions = new ArrayList<>();

    @Builder.Default
    private List<AppointmentItem> appointments = new ArrayList<>();

    @Builder.Default
    private List<WarningSignItem> warningSigns = new ArrayList<>();

    private String emergencyInstructions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationItem {
        private String name;
        private String dosage;
        private String frequency; // e.g. "ONCE_DAILY", "TWICE_DAILY", "THRICE_DAILY"
        @Builder.Default
        private List<String> timesOfDay = new ArrayList<>(); // e.g. ["08:00", "20:00"]
        private String instructions; // e.g. "Take with food"
        private Integer durationDays; // e.g. 14
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WoundCareItem {
        private String title;
        private String instructions;
        private String frequency; // e.g. "DAILY_MORNING"
        private String timeOfDay; // e.g. "09:00"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DietItem {
        private String instruction;
        private String restrictions;
        private String mealGuidelines;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItem {
        private String activity;
        private String restrictionLevel; // "NO_LIFTING", "REST", "LIGHT_WALKING"
        private String details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentItem {
        private String doctorName;
        private String department;
        private String clinicLocation;
        private String scheduledDate; // YYYY-MM-DD
        private String scheduledTime; // HH:mm
        private String purpose;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarningSignItem {
        private String symptom;
        private String actionRequired;
        private String urgency; // "MODERATE", "URGENT", "EMERGENCY"
    }
}

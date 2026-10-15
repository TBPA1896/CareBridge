package com.carebridge.service;

import com.carebridge.model.*;
import com.carebridge.model.StructuredInstructions.*;
import com.carebridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSeedService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;
    private final DischargeInstructionRepository dischargeInstructionRepository;
    private final RecoveryPlanRepository recoveryPlanRepository;
    private final RecoveryTaskRepository recoveryTaskRepository;
    private final AdherenceEventRepository adherenceEventRepository;
    private final DeviationAlertRepository deviationAlertRepository;
    private final NotificationRepository notificationRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final RecoveryWorkflowEngine workflowEngine;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("${SEED_ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${SEED_CLINICIAN_PASSWORD:}")
    private String clinicianPassword;

    @Value("${SEED_PATIENT_PASSWORD:}")
    private String patientPassword;

    @Value("${SEED_CAREGIVER_PASSWORD:}")
    private String caregiverPassword;

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Synthetic seed data is disabled.");
            return;
        }

        if (userRepository.existsByEmail("admin@carebridge.health")) {
            log.info("CareBridge database already seeded. Skipping initial data seed.");
            return;
        }

        if (adminPassword.isBlank() || clinicianPassword.isBlank()
                || patientPassword.isBlank() || caregiverPassword.isBlank()) {
            throw new IllegalStateException(
                    "Set SEED_ADMIN_PASSWORD, SEED_CLINICIAN_PASSWORD, "
                            + "SEED_PATIENT_PASSWORD, and SEED_CAREGIVER_PASSWORD to enable seed data.");
        }

        log.info("=================================================================");
        log.info("SEEDING SYNTHETIC DEMONSTRATION DATA FOR CAREBRIDGE PLATFORM");
        log.info("=================================================================");

        // 1. Seed Admin
        User admin = User.builder()
                .email("admin@carebridge.health")
                .password(passwordEncoder.encode(adminPassword))
                .fullName("System Administrator")
                .role(Role.ADMIN)
                .phone("+91-9876543210")
                .status(UserStatus.ACTIVE)
                .build();
        admin = userRepository.save(admin);

        // 2. Seed Clinician / Doctor
        User doctor = User.builder()
                .email("dr.sharma@carebridge.health")
                .password(passwordEncoder.encode(clinicianPassword))
                .fullName("Dr. Alok Sharma, MD (Cardiology)")
                .role(Role.CLINICIAN)
                .phone("+91-9876543211")
                .status(UserStatus.ACTIVE)
                .build();
        doctor = userRepository.save(doctor);

        // 3. Seed Patient
        User patient = User.builder()
                .email("rajesh.patel@carebridge.health")
                .password(passwordEncoder.encode(patientPassword))
                .fullName("Rajesh Patel")
                .role(Role.PATIENT)
                .phone("+91-9876543212")
                .status(UserStatus.ACTIVE)
                .build();
        patient = userRepository.save(patient);

        PatientProfile patientProfile = PatientProfile.builder()
                .userId(patient.getId())
                .dateOfBirth(LocalDate.of(1968, 5, 14))
                .gender("Male")
                .bloodGroup("B+")
                .emergencyContactName("Priya Patel")
                .emergencyContactPhone("+91-9876543213")
                .allergies(List.of("Penicillin", "Sulfa drugs"))
                .medicalConditions(List.of("Hypertension", "Post-CABG", "Type 2 Diabetes"))
                .build();
        patientProfileRepository.save(patientProfile);

        // 4. Seed Caregiver
        User caregiver = User.builder()
                .email("priya.patel@carebridge.health")
                .password(passwordEncoder.encode(caregiverPassword))
                .fullName("Priya Patel")
                .role(Role.CAREGIVER)
                .phone("+91-9876543213")
                .status(UserStatus.ACTIVE)
                .build();
        caregiver = userRepository.save(caregiver);

        // 5. Seed Approved Caregiver Link
        CaregiverLink link = CaregiverLink.builder()
                .caregiverId(caregiver.getId())
                .caregiverName(caregiver.getFullName())
                .caregiverEmail(caregiver.getEmail())
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .patientEmail(patient.getEmail())
                .relationship("Daughter & Primary Caregiver")
                .status(CaregiverLinkStatus.APPROVED)
                .canReceiveAlerts(true)
                .requestedAt(Instant.now().minus(5, ChronoUnit.DAYS))
                .respondedAt(Instant.now().minus(5, ChronoUnit.DAYS))
                .notes("Primary family caregiver monitoring medication compliance.")
                .build();
        caregiverLinkRepository.save(link);

        // 6. Seed Discharge Instructions (Cardiology Post-CABG)
        StructuredInstructions structured = StructuredInstructions.builder()
                .medications(List.of(
                        MedicationItem.builder()
                                .name("Aspirin")
                                .dosage("75mg")
                                .frequency("ONCE_DAILY")
                                .timesOfDay(List.of("08:00"))
                                .instructions("Take after breakfast with a full glass of water.")
                                .durationDays(14)
                                .build(),
                        MedicationItem.builder()
                                .name("Metoprolol Tartrate")
                                .dosage("25mg")
                                .frequency("TWICE_DAILY")
                                .timesOfDay(List.of("08:00", "20:00"))
                                .instructions("Take morning and evening after meals. Check pulse before taking.")
                                .durationDays(14)
                                .build(),
                        MedicationItem.builder()
                                .name("Atorvastatin")
                                .dosage("20mg")
                                .frequency("ONCE_DAILY_NIGHT")
                                .timesOfDay(List.of("21:00"))
                                .instructions("Take at bedtime.")
                                .durationDays(14)
                                .build()
                ))
                .woundCareTasks(List.of(
                        WoundCareItem.builder()
                                .title("Sternal Incision Dressing Check & Clean")
                                .instructions("Inspect surgical incision site for redness or drainage. Clean gently with saline and apply sterile dry pad.")
                                .frequency("DAILY_MORNING")
                                .timeOfDay("09:00")
                                .build()
                ))
                .dietInstructions(List.of(
                        DietItem.builder()
                                .instruction("Low-Sodium Cardiac Diet")
                                .restrictions("Under 2,000 mg sodium daily. Strictly avoid processed meats, salted snacks, and canned soups.")
                                .mealGuidelines("Eat fresh vegetables, whole grains, steamed fish, and fresh fruits.")
                                .build()
                ))
                .activityRestrictions(List.of(
                        ActivityItem.builder()
                                .activity("Gentle Walking Routine")
                                .restrictionLevel("PERMITTED")
                                .details("Walk for 10-15 minutes at a relaxed pace twice daily on flat ground.")
                                .build(),
                        ActivityItem.builder()
                                .activity("Sternal Precaution / Heavy Lifting")
                                .restrictionLevel("RESTRICTED")
                                .details("Do NOT lift, push, or pull anything heavier than 5 kg (10 lbs) for 6 weeks.")
                                .build()
                ))
                .appointments(List.of(
                        AppointmentItem.builder()
                                .doctorName("Dr. Alok Sharma")
                                .department("Cardiology OPD")
                                .clinicLocation("CareBridge Heart Institute, Suite 302")
                                .scheduledDate(LocalDate.now().plusDays(7).toString())
                                .scheduledTime("11:00")
                                .purpose("Post-CABG 2-week clinical review, ECG, and suture inspection.")
                                .build()
                ))
                .warningSigns(List.of(
                        WarningSignItem.builder()
                                .symptom("Severe chest pressure or sudden shortness of breath")
                                .actionRequired("Call emergency medical services (112) immediately.")
                                .urgency("EMERGENCY")
                                .build(),
                        WarningSignItem.builder()
                                .symptom("Fever over 101°F (38.3°C) or chills")
                                .actionRequired("Notify clinic or attending cardiologist.")
                                .urgency("URGENT")
                                .build(),
                        WarningSignItem.builder()
                                .symptom("Increased drainage, redness, or reopening of sternal incision")
                                .actionRequired("Contact wound care coordinator promptly.")
                                .urgency("URGENT")
                                .build()
                ))
                .emergencyInstructions("If experiencing crushing chest pain, radiating left arm pain, or severe difficulty breathing, dial 112 immediately and inform your caregiver.")
                .build();

        DischargeInstruction instruction = DischargeInstruction.builder()
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .hospitalName("CareBridge Heart & Multi-Specialty Hospital")
                .attendingPhysician("Dr. Alok Sharma, MD (Cardiology)")
                .dischargeDate(LocalDate.now().minusDays(2))
                .diagnosis("Status Post Coronary Artery Bypass Grafting (CABG x 3)")
                .rawInstructionText("Patient Rajesh Patel discharged post CABG surgery. Prescribe Tab. Aspirin 75mg once daily morning after breakfast. Tab. Metoprolol 25mg twice daily after meals at 8:00 AM and 8:00 PM. Tab. Atorvastatin 20mg once at night. Daily morning wound cleaning of sternal incision with dry sterile dressing. Strict low-sodium cardiac diet under 2g salt. Sternal precautions: no lifting over 5kg. Light walking permitted 15 minutes twice daily. Follow up in Cardiology OPD with Dr. Sharma in 10 days.")
                .extractedDraft(structured)
                .verificationStatus(VerificationStatus.VERIFIED)
                .verifiedByUserId(doctor.getId())
                .verifiedByName(doctor.getFullName())
                .verifiedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                .clinicalNotes("Patient demonstrated clear understanding of discharge protocol. Family caregiver Priya Patel educated on wound inspection and dosage schedule.")
                .build();
        instruction = dischargeInstructionRepository.save(instruction);

        // 7. Seed Active Recovery Plan
        RecoveryPlan plan = RecoveryPlan.builder()
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .dischargeInstructionId(instruction.getId())
                .title("Post-CABG Cardiac Recovery & Rehabilitation (14 Days)")
                .diagnosis("Post Coronary Artery Bypass Graft (CABG)")
                .startDate(LocalDate.now().minusDays(2))
                .endDate(LocalDate.now().plusDays(12))
                .durationDays(14)
                .status(PlanStatus.ACTIVE)
                .warningSigns(List.of(
                        "Fever > 101°F",
                        "Sternal incision redness or drainage",
                        "Chest pain or acute dyspnea"
                ))
                .emergencyInstructions("Dial 112 for severe chest pain, extreme breathlessness, or fainting.")
                .verifiedByUserId(doctor.getId())
                .verifiedByName(doctor.getFullName())
                .verifiedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                .activatedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                .build();
        plan = recoveryPlanRepository.save(plan);

        // Update patient profile with active plan
        patientProfile.setActiveRecoveryPlanId(plan.getId());
        patientProfileRepository.save(patientProfile);

        // 8. Generate Schedule of Tasks using RecoveryWorkflowEngine
        List<RecoveryTask> tasks = workflowEngine.generateScheduleForPlan(plan, structured);

        // 9. Mark some past tasks as COMPLETED and 1 as LATE_COMPLETED to populate realistic analytics
        LocalDate dayMinus2 = LocalDate.now().minusDays(2);
        LocalDate dayMinus1 = LocalDate.now().minusDays(1);

        for (RecoveryTask t : tasks) {
            if (t.getScheduledDate().equals(dayMinus2)) {
                t.setStatus(TaskStatus.COMPLETED);
                t.setActualReportedTime(t.getScheduledTime());
                t.setCompletedAt(Instant.now().minus(2, ChronoUnit.DAYS));
                recoveryTaskRepository.save(t);

                adherenceEventRepository.save(AdherenceEvent.builder()
                        .taskId(t.getId())
                        .patientId(patient.getId())
                        .recoveryPlanId(plan.getId())
                        .taskTitle(t.getTitle())
                        .category(t.getCategory())
                        .scheduledDateTime(LocalDateTime.of(dayMinus2, LocalTime.parse(t.getScheduledTime())))
                        .actualReportedDateTime(LocalDateTime.of(dayMinus2, LocalTime.parse(t.getScheduledTime())))
                        .deviationMinutes(0L)
                        .status(AdherenceStatus.ON_TIME)
                        .patientNotes("Taken with breakfast as instructed.")
                        .reportedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                        .build());
            } else if (t.getScheduledDate().equals(dayMinus1)) {
                if ("08:00".equals(t.getScheduledTime()) && t.getTitle().contains("Metoprolol")) {
                    // Late task: scheduled 08:00, taken 10:15 (135 min delay)
                    t.setStatus(TaskStatus.LATE_COMPLETED);
                    t.setActualReportedTime("10:15");
                    t.setReportedNotes("Woke up late, took dose after brunch.");
                    t.setCompletedAt(Instant.now().minus(1, ChronoUnit.DAYS));
                    recoveryTaskRepository.save(t);

                    adherenceEventRepository.save(AdherenceEvent.builder()
                            .taskId(t.getId())
                            .patientId(patient.getId())
                            .recoveryPlanId(plan.getId())
                            .taskTitle(t.getTitle())
                            .category(t.getCategory())
                            .scheduledDateTime(LocalDateTime.of(dayMinus1, LocalTime.of(8, 0)))
                            .actualReportedDateTime(LocalDateTime.of(dayMinus1, LocalTime.of(10, 15)))
                            .deviationMinutes(135L)
                            .status(AdherenceStatus.DELAYED)
                            .patientNotes("Woke up late, took dose after brunch.")
                            .reportedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                            .build());

                    // Deviation Alert for this late medication
                    DeviationAlert lateAlert = DeviationAlert.builder()
                            .patientId(patient.getId())
                            .patientName(patient.getFullName())
                            .recoveryPlanId(plan.getId())
                            .taskId(t.getId())
                            .taskTitle(t.getTitle())
                            .alertType(AlertType.LATE_MEDICATION)
                            .severity(AlertSeverity.MEDIUM)
                            .message("Metoprolol Tartrate (25mg) was taken 135 minutes late (2.3 hours deviation) by Rajesh Patel.")
                            .details("Scheduled: 08:00 AM • Reported: 10:15 AM • Reason: Woke up late")
                            .deviationMinutes(135L)
                            .isAcknowledged(false)
                            .createdAt(Instant.now().minus(1, ChronoUnit.DAYS))
                            .build();
                    deviationAlertRepository.save(lateAlert);
                } else {
                    t.setStatus(TaskStatus.COMPLETED);
                    t.setActualReportedTime(t.getScheduledTime());
                    t.setCompletedAt(Instant.now().minus(1, ChronoUnit.DAYS));
                    recoveryTaskRepository.save(t);

                    adherenceEventRepository.save(AdherenceEvent.builder()
                            .taskId(t.getId())
                            .patientId(patient.getId())
                            .recoveryPlanId(plan.getId())
                            .taskTitle(t.getTitle())
                            .category(t.getCategory())
                            .scheduledDateTime(LocalDateTime.of(dayMinus1, LocalTime.parse(t.getScheduledTime())))
                            .actualReportedDateTime(LocalDateTime.of(dayMinus1, LocalTime.parse(t.getScheduledTime())))
                            .deviationMinutes(0L)
                            .status(AdherenceStatus.ON_TIME)
                            .reportedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                            .build());
                }
            }
        }

        // 10. Sample Notifications
        notificationRepository.save(Notification.builder()
                .recipientUserId(patient.getId())
                .patientId(patient.getId())
                .title("Welcome to CareBridge")
                .message("Your post-discharge recovery plan is active. Check today's tasks and record your medication.")
                .type(NotificationType.PLAN_UPDATED)
                .isRead(true)
                .createdAt(Instant.now().minus(2, ChronoUnit.DAYS))
                .build());

        notificationRepository.save(Notification.builder()
                .recipientUserId(caregiver.getId())
                .patientId(patient.getId())
                .title("Adherence Alert: Late Medication")
                .message("Rajesh Patel took Metoprolol Tartrate (25mg) 135 minutes late yesterday.")
                .type(NotificationType.CAREGIVER_ALERT)
                .isRead(false)
                .createdAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .build());

        log.info("Synthetic demo data seed complete!");
        log.info("=================================================================");
    }
}

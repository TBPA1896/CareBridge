package com.carebridge.service;

import com.carebridge.exception.BadRequestException;
import com.carebridge.model.*;
import com.carebridge.model.StructuredInstructions.*;
import com.carebridge.repository.AppointmentRepository;
import com.carebridge.repository.RecoveryTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecoveryWorkflowEngine {

    private final RecoveryTaskRepository taskRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * Converts verified discharge instructions and an approved recovery plan
     * into a day-by-day scheduled checklist of concrete recovery tasks.
     */
    public List<RecoveryTask> generateScheduleForPlan(RecoveryPlan plan, StructuredInstructions instructions) {
        if (plan == null || instructions == null) {
            throw new BadRequestException("Plan and verified instructions must not be null.");
        }

        // Idempotency check: prevent duplicate schedule generation
        if (taskRepository.existsByRecoveryPlanId(plan.getId())) {
            log.warn("Recovery tasks already generated for plan id: {}", plan.getId());
            return taskRepository.findByRecoveryPlanId(plan.getId());
        }

        List<RecoveryTask> generatedTasks = new ArrayList<>();
        LocalDate startDate = plan.getStartDate() != null ? plan.getStartDate() : LocalDate.now();
        int totalDays = plan.getDurationDays() != null && plan.getDurationDays() > 0 ? plan.getDurationDays() : 14;

        log.info("Generating {}-day recovery schedule for plan: '{}' starting from {}", totalDays, plan.getTitle(), startDate);

        for (int day = 1; day <= totalDays; day++) {
            LocalDate currentDate = startDate.plusDays(day - 1);

            // 1. Medications
            if (instructions.getMedications() != null) {
                for (MedicationItem med : instructions.getMedications()) {
                    int duration = med.getDurationDays() != null ? med.getDurationDays() : totalDays;
                    if (day <= duration) {
                        List<String> times = (med.getTimesOfDay() != null && !med.getTimesOfDay().isEmpty())
                                ? med.getTimesOfDay()
                                : List.of("08:00");

                        for (String time : times) {
                            generatedTasks.add(RecoveryTask.builder()
                                    .recoveryPlanId(plan.getId())
                                    .patientId(plan.getPatientId())
                                    .dayNumber(day)
                                    .scheduledDate(currentDate)
                                    .scheduledTime(time)
                                    .category(TaskCategory.MEDICATION)
                                    .title(med.getName() + " (" + med.getDosage() + ")")
                                    .description("Dosage: " + med.getDosage() + " • " + med.getFrequency())
                                    .dosage(med.getDosage())
                                    .frequency(med.getFrequency())
                                    .instructions(med.getInstructions())
                                    .status(TaskStatus.PENDING)
                                    .isRecurring(true)
                                    .sourceInstructionRef("Medication Schedule: " + med.getName())
                                    .build());
                        }
                    }
                }
            }

            // 2. Wound Care Tasks (Every morning or per frequency)
            if (instructions.getWoundCareTasks() != null) {
                for (WoundCareItem wound : instructions.getWoundCareTasks()) {
                    generatedTasks.add(RecoveryTask.builder()
                            .recoveryPlanId(plan.getId())
                            .patientId(plan.getPatientId())
                            .dayNumber(day)
                            .scheduledDate(currentDate)
                            .scheduledTime(wound.getTimeOfDay() != null ? wound.getTimeOfDay() : "09:00")
                            .category(TaskCategory.WOUND_CARE)
                            .title(wound.getTitle())
                            .description(wound.getInstructions())
                            .instructions(wound.getInstructions())
                            .status(TaskStatus.PENDING)
                            .isRecurring(true)
                            .sourceInstructionRef("Wound Care: " + wound.getTitle())
                            .build());
                }
            }

            // 3. Dietary Guidelines (Daily lunch reminder)
            if (instructions.getDietInstructions() != null && !instructions.getDietInstructions().isEmpty()) {
                DietItem diet = instructions.getDietInstructions().get(0);
                generatedTasks.add(RecoveryTask.builder()
                        .recoveryPlanId(plan.getId())
                        .patientId(plan.getPatientId())
                        .dayNumber(day)
                        .scheduledDate(currentDate)
                        .scheduledTime("12:30")
                        .category(TaskCategory.DIET)
                        .title("Diet: " + diet.getInstruction())
                        .description(diet.getRestrictions() + " • " + diet.getMealGuidelines())
                        .instructions(diet.getRestrictions())
                        .status(TaskStatus.PENDING)
                        .isRecurring(true)
                        .sourceInstructionRef("Dietary Protocol")
                        .build());
            }

            // 4. Activity Restrictions & Walking (Late afternoon)
            if (instructions.getActivityRestrictions() != null) {
                for (ActivityItem act : instructions.getActivityRestrictions()) {
                    generatedTasks.add(RecoveryTask.builder()
                            .recoveryPlanId(plan.getId())
                            .patientId(plan.getPatientId())
                            .dayNumber(day)
                            .scheduledDate(currentDate)
                            .scheduledTime("17:00")
                            .category(TaskCategory.ACTIVITY_RESTRICTION)
                            .title("Activity: " + act.getActivity())
                            .description(act.getRestrictionLevel() + ": " + act.getDetails())
                            .instructions(act.getDetails())
                            .status(TaskStatus.PENDING)
                            .isRecurring(true)
                            .sourceInstructionRef("Physical Activity Protocol")
                            .build());
                }
            }

            // 5. Daily Warning Signs Self-Check (Evening 19:00)
            if (instructions.getWarningSigns() != null && !instructions.getWarningSigns().isEmpty()) {
                generatedTasks.add(RecoveryTask.builder()
                        .recoveryPlanId(plan.getId())
                        .patientId(plan.getPatientId())
                        .dayNumber(day)
                        .scheduledDate(currentDate)
                        .scheduledTime("19:00")
                        .category(TaskCategory.WARNING_SIGN)
                        .title("Daily Symptom & Warning Signs Check")
                        .description("Review surgical site and check temperature. Report any fever, acute pain, or abnormal redness.")
                        .instructions("If fever > 101°F or severe symptoms appear, notify caregiver immediately.")
                        .status(TaskStatus.PENDING)
                        .isRecurring(true)
                        .sourceInstructionRef("Clinical Warning Sign Protocol")
                        .build());
            }
        }

        // 6. Follow-up Appointments
        if (instructions.getAppointments() != null) {
            for (AppointmentItem appt : instructions.getAppointments()) {
                LocalDate apptDate = null;
                if (appt.getScheduledDate() != null) {
                    try {
                        apptDate = LocalDate.parse(appt.getScheduledDate());
                    } catch (Exception ignored) {
                        apptDate = startDate.plusDays(10);
                    }
                } else {
                    apptDate = startDate.plusDays(10);
                }

                String apptTime = appt.getScheduledTime() != null ? appt.getScheduledTime() : "10:30";

                // Save appointment document
                Appointment appointment = Appointment.builder()
                        .patientId(plan.getPatientId())
                        .recoveryPlanId(plan.getId())
                        .doctorName(appt.getDoctorName())
                        .department(appt.getDepartment())
                        .clinicLocation(appt.getClinicLocation())
                        .scheduledDateTime(LocalDateTime.of(apptDate, LocalTime.parse(apptTime)))
                        .purpose(appt.getPurpose())
                        .status(AppointmentStatus.SCHEDULED)
                        .build();
                appointmentRepository.save(appointment);

                // Add as a special task on that date
                generatedTasks.add(RecoveryTask.builder()
                        .recoveryPlanId(plan.getId())
                        .patientId(plan.getPatientId())
                        .dayNumber((int) java.time.temporal.ChronoUnit.DAYS.between(startDate, apptDate) + 1)
                        .scheduledDate(apptDate)
                        .scheduledTime(apptTime)
                        .category(TaskCategory.FOLLOW_UP)
                        .title("Follow-Up: " + appt.getDoctorName())
                        .description(appt.getDepartment() + " • " + appt.getClinicLocation() + " • Purpose: " + appt.getPurpose())
                        .instructions("Bring discharge paperwork and current medication list.")
                        .status(TaskStatus.PENDING)
                        .isRecurring(false)
                        .sourceInstructionRef("Outpatient Follow-up Protocol")
                        .build());
            }
        }

        List<RecoveryTask> saved = taskRepository.saveAll(generatedTasks);
        log.info("Successfully generated and persisted {} recovery tasks for plan id {}", saved.size(), plan.getId());
        return saved;
    }
}

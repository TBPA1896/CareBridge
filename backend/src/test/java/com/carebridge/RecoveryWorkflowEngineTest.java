package com.carebridge;

import com.carebridge.model.*;
import com.carebridge.model.StructuredInstructions.*;
import com.carebridge.repository.AppointmentRepository;
import com.carebridge.repository.RecoveryTaskRepository;
import com.carebridge.service.RecoveryWorkflowEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecoveryWorkflowEngineTest {

    @Mock
    private RecoveryTaskRepository taskRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private RecoveryWorkflowEngine workflowEngine;

    private RecoveryPlan samplePlan;
    private StructuredInstructions sampleInstructions;

    @BeforeEach
    void setUp() {
        samplePlan = RecoveryPlan.builder()
                .id("plan-123")
                .patientId("patient-456")
                .patientName("Rajesh Patel")
                .title("Post-CABG Recovery Plan")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 15))
                .durationDays(14)
                .status(PlanStatus.VERIFIED)
                .build();

        sampleInstructions = StructuredInstructions.builder()
                .medications(List.of(
                        MedicationItem.builder()
                                .name("Aspirin")
                                .dosage("75mg")
                                .frequency("ONCE_DAILY")
                                .timesOfDay(List.of("08:00"))
                                .instructions("Take with food")
                                .durationDays(14)
                                .build(),
                        MedicationItem.builder()
                                .name("Metoprolol")
                                .dosage("25mg")
                                .frequency("TWICE_DAILY")
                                .timesOfDay(List.of("08:00", "20:00"))
                                .instructions("Take with water")
                                .durationDays(14)
                                .build()
                ))
                .woundCareTasks(List.of(
                        WoundCareItem.builder()
                                .title("Daily Incision Cleaning")
                                .instructions("Clean with saline dressing")
                                .frequency("DAILY_MORNING")
                                .timeOfDay("09:00")
                                .build()
                ))
                .dietInstructions(List.of(
                        DietItem.builder()
                                .instruction("Low Sodium Diet")
                                .restrictions("Under 2g sodium")
                                .mealGuidelines("Fresh meals")
                                .build()
                ))
                .build();
    }

    @Test
    @DisplayName("Should generate structured recovery tasks across all 14 recovery days")
    void shouldGenerateScheduleFor14Days() {
        when(taskRepository.existsByRecoveryPlanId("plan-123")).thenReturn(false);
        when(taskRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<RecoveryTask> tasks = workflowEngine.generateScheduleForPlan(samplePlan, sampleInstructions);

        assertNotNull(tasks);
        assertFalse(tasks.isEmpty());

        // Daily tasks: Aspirin (1) + Metoprolol (2) + Wound care (1) + Diet (1) = 5 tasks per day * 14 days = 70 tasks
        assertEquals(70, tasks.size());

        // Verify task attributes
        RecoveryTask day1Med = tasks.stream()
                .filter(t -> t.getDayNumber() == 1 && t.getTitle().contains("Aspirin"))
                .findFirst()
                .orElse(null);

        assertNotNull(day1Med);
        assertEquals(LocalDate.of(2026, 10, 1), day1Med.getScheduledDate());
        assertEquals("08:00", day1Med.getScheduledTime());
        assertEquals(TaskCategory.MEDICATION, day1Med.getCategory());
        assertEquals(TaskStatus.PENDING, day1Med.getStatus());

        verify(taskRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("Should be idempotent and prevent duplicate task generation")
    void shouldPreventDuplicateGeneration() {
        when(taskRepository.existsByRecoveryPlanId("plan-123")).thenReturn(true);
        when(taskRepository.findByRecoveryPlanId("plan-123")).thenReturn(List.of(
                RecoveryTask.builder().id("task-1").recoveryPlanId("plan-123").build()
        ));

        List<RecoveryTask> tasks = workflowEngine.generateScheduleForPlan(samplePlan, sampleInstructions);

        assertEquals(1, tasks.size());
        verify(taskRepository, never()).saveAll(anyList());
    }
}

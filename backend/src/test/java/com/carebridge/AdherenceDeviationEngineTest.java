package com.carebridge;

import com.carebridge.model.*;
import com.carebridge.repository.AdherenceEventRepository;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.repository.DeviationAlertRepository;
import com.carebridge.repository.UserRepository;
import com.carebridge.service.AdherenceDeviationEngine;
import com.carebridge.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdherenceDeviationEngineTest {

    @Mock
    private AdherenceEventRepository adherenceRepository;

    @Mock
    private DeviationAlertRepository alertRepository;

    @Mock
    private CaregiverLinkRepository caregiverLinkRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdherenceDeviationEngine deviationEngine;

    private RecoveryTask sampleTask;
    private User patientUser;

    @BeforeEach
    void setUp() {
        patientUser = User.builder()
                .id("pat-1")
                .fullName("Rajesh Patel")
                .email("rajesh@carebridge.health")
                .role(Role.PATIENT)
                .build();

        sampleTask = RecoveryTask.builder()
                .id("task-100")
                .patientId("pat-1")
                .recoveryPlanId("plan-1")
                .title("Metoprolol 25mg")
                .scheduledDate(LocalDate.now())
                .scheduledTime("08:00")
                .category(TaskCategory.MEDICATION)
                .status(TaskStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should detect on-time medication when reported within 60 minutes")
    void shouldDetectOnTimeMedication() {
        when(adherenceRepository.save(any(AdherenceEvent.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById("pat-1")).thenReturn(Optional.of(patientUser));

        AdherenceEvent event = deviationEngine.processTaskAdherence(
                sampleTask,
                TaskStatus.COMPLETED,
                "08:25", // 25 minutes after scheduled
                "Taken after breakfast",
                null
        );

        assertNotNull(event);
        assertEquals(AdherenceStatus.ON_TIME, event.getStatus());
        assertEquals(25L, event.getDeviationMinutes());

        // Should not trigger a late alert
        verify(alertRepository, never()).save(any(DeviationAlert.class));
    }

    @Test
    @DisplayName("Should detect late medication and generate alert when deviation exceeds 60 minutes")
    void shouldDetectLateMedicationAndAlert() {
        when(adherenceRepository.save(any(AdherenceEvent.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById("pat-1")).thenReturn(Optional.of(patientUser));
        when(alertRepository.findByTaskIdAndAlertTypeAndIsAcknowledgedFalse("task-100", AlertType.LATE_MEDICATION))
                .thenReturn(Optional.empty());

        DeviationAlert mockAlert = DeviationAlert.builder().id("alert-1").build();
        when(alertRepository.save(any(DeviationAlert.class))).thenReturn(mockAlert);

        // Caregiver link setup
        CaregiverLink link = CaregiverLink.builder()
                .caregiverId("cg-1")
                .patientId("pat-1")
                .canReceiveAlerts(true)
                .status(CaregiverLinkStatus.APPROVED)
                .build();
        when(caregiverLinkRepository.findByPatientIdAndStatus("pat-1", CaregiverLinkStatus.APPROVED))
                .thenReturn(List.of(link));

        AdherenceEvent event = deviationEngine.processTaskAdherence(
                sampleTask,
                TaskStatus.LATE_COMPLETED,
                "10:30", // 150 minutes late
                "Delayed due to morning errand",
                null
        );

        assertNotNull(event);
        assertEquals(AdherenceStatus.DELAYED, event.getStatus());
        assertEquals(150L, event.getDeviationMinutes());

        // Alert should be saved and broadcast to caregiver
        verify(alertRepository, atLeastOnce()).save(any(DeviationAlert.class));
        verify(notificationService, atLeastOnce()).sendNotification(
                eq("cg-1"), eq("pat-1"), anyString(), anyString(), eq(NotificationType.CAREGIVER_ALERT), any()
        );
    }

    @Test
    @DisplayName("Should detect repeated deviations within 48h and trigger critical alert")
    void shouldDetectRepeatedDeviations() {
        when(adherenceRepository.findByPatientIdAndReportedAtAfterOrderByReportedAtDesc(eq("pat-1"), any(Instant.class)))
                .thenReturn(List.of(
                        AdherenceEvent.builder().status(AdherenceStatus.DELAYED).build(),
                        AdherenceEvent.builder().status(AdherenceStatus.MISSED).build()
                ));
        when(alertRepository.findByPatientIdAndIsAcknowledgedFalseOrderByCreatedAtDesc("pat-1"))
                .thenReturn(List.of());

        DeviationAlert alert = DeviationAlert.builder().id("rep-alert-1").build();
        when(alertRepository.save(any(DeviationAlert.class))).thenReturn(alert);

        deviationEngine.checkRepeatedDeviations("pat-1", "Rajesh Patel", "plan-1");

        verify(alertRepository, times(1)).save(argThat(a ->
                a.getAlertType() == AlertType.REPEATED_DEVIATION && a.getSeverity() == AlertSeverity.CRITICAL
        ));
    }
}

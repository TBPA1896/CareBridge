package com.carebridge.service;

import com.carebridge.dto.response.DashboardStatsResponse;
import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.model.*;
import com.carebridge.repository.*;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RecoveryPlanRepository planRepository;
    private final RecoveryTaskRepository taskRepository;
    private final DeviationAlertRepository alertRepository;
    private final AdherenceEventRepository adherenceRepository;
    private final AuditLogService auditLogService;

    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalPatients = userRepository.countByRole(Role.PATIENT);
        long totalCaregivers = userRepository.countByRole(Role.CAREGIVER);
        long activePlans = planRepository.countByStatus(PlanStatus.ACTIVE);
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED) + taskRepository.countByStatus(TaskStatus.LATE_COMPLETED);

        double adherenceRate = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 100.0;
        long totalAlerts = alertRepository.count();
        long unacknowledgedAlerts = alertRepository.countByIsAcknowledgedFalse();

        // Tasks by category breakdown
        Map<String, Long> tasksByCategory = new HashMap<>();
        for (TaskCategory cat : TaskCategory.values()) {
            long count = taskRepository.findAll().stream()
                    .filter(t -> t.getCategory() == cat)
                    .count();
            if (count > 0) {
                tasksByCategory.put(cat.name(), count);
            }
        }

        // Alerts by severity breakdown
        Map<String, Long> alertsBySeverity = new HashMap<>();
        for (AlertSeverity sev : AlertSeverity.values()) {
            long count = alertRepository.findAll().stream()
                    .filter(a -> a.getSeverity() == sev)
                    .count();
            if (count > 0) {
                alertsBySeverity.put(sev.name(), count);
            }
        }

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalPatients(totalPatients)
                .totalCaregivers(totalCaregivers)
                .activeRecoveryPlans(activePlans)
                .totalTasks(totalTasks)
                .totalCompletedTasks(completedTasks)
                .overallAdherenceRate(Math.round(adherenceRate * 10.0) / 10.0)
                .activeAlertsCount(totalAlerts)
                .unacknowledgedAlertsCount(unacknowledgedAlerts)
                .tasksByCategory(tasksByCategory)
                .alertsBySeverity(alertsBySeverity)
                .build();
    }

    public List<User> getUsers(Role role) {
        if (role != null) {
            return userRepository.findByRole(role);
        }
        return userRepository.findAll();
    }

    public User toggleUserStatus(String userId, UserStatus status, UserPrincipal admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setStatus(status);
        User updated = userRepository.save(user);

        auditLogService.logAction(admin.getId(), admin.getEmail(), admin.getRole().name(),
                "UPDATE_USER_STATUS", "User", userId, "Changed status to: " + status);

        return updated;
    }
}

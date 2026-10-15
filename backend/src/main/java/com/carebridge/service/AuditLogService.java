package com.carebridge.service;

import com.carebridge.model.AuditLog;
import com.carebridge.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(String userId, String userEmail, String userRole, String action, String entityName, String entityId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .userRole(userRole)
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .details(details)
                    .timestamp(Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
            log.info("AUDIT: user={}, role={}, action={}, entity={}/{}", userEmail, userRole, action, entityName, entityId);
        } catch (Exception ex) {
            log.error("Failed to write audit log: {}", ex.getMessage());
        }
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}

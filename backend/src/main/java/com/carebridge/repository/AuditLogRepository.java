package com.carebridge.repository;

import com.carebridge.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findTop50ByOrderByTimestampDesc();
    List<AuditLog> findByUserIdOrderByTimestampDesc(String userId);
    List<AuditLog> findByEntityNameAndEntityIdOrderByTimestampDesc(String entityName, String entityId);
}

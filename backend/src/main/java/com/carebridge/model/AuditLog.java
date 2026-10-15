package com.carebridge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "auditLogs")
@CompoundIndex(name = "user_time_idx", def = "{'userId': 1, 'timestamp': -1}")
@CompoundIndex(name = "time_desc_idx", def = "{'timestamp': -1}")
public class AuditLog {

    @Id
    private String id;

    private String userId;

    private String userEmail;

    private String userRole;

    private String action;

    private String entityName;

    private String entityId;

    private String details;

    @CreatedDate
    private Instant timestamp;
}

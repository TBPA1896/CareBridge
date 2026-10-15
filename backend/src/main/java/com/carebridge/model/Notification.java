package com.carebridge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
@CompoundIndex(name = "user_read_idx", def = "{'recipientUserId': 1, 'isRead': 1}")
@CompoundIndex(name = "user_created_idx", def = "{'recipientUserId': 1, 'createdAt': -1}")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String recipientUserId;

    private String patientId;

    private String title;

    private String message;

    private NotificationType type;

    @Builder.Default
    private boolean isRead = false;

    private String referenceEntityId;

    @CreatedDate
    private Instant createdAt;
}

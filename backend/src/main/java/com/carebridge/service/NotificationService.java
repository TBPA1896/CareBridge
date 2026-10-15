package com.carebridge.service;

import com.carebridge.exception.ResourceNotFoundException;
import com.carebridge.exception.UnauthorizedException;
import com.carebridge.model.Notification;
import com.carebridge.model.NotificationType;
import com.carebridge.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification sendNotification(String recipientUserId, String patientId, String title, String message,
                                         NotificationType type, String referenceEntityId) {
        Notification notification = Notification.builder()
                .recipientUserId(recipientUserId)
                .patientId(patientId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .referenceEntityId(referenceEntityId)
                .createdAt(Instant.now())
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getRecipientUserId().equals(userId)) {
            throw new UnauthorizedException("You cannot mark another user's notification as read.");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}

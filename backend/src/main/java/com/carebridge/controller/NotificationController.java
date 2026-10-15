package com.carebridge.controller;

import com.carebridge.model.Notification;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userPrincipal.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userPrincipal.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id,
                                                   @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userPrincipal.getId()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read."));
    }
}

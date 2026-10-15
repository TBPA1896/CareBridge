package com.carebridge.controller;

import com.carebridge.dto.response.DashboardStatsResponse;
import com.carebridge.model.AuditLog;
import com.carebridge.model.Role;
import com.carebridge.model.User;
import com.carebridge.model.UserStatus;
import com.carebridge.security.UserPrincipal;
import com.carebridge.service.AdminService;
import com.carebridge.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) Role role) {
        return ResponseEntity.ok(adminService.getUsers(role));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable String userId,
                                                 @RequestParam UserStatus status,
                                                 @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        return ResponseEntity.ok(adminService.toggleUserStatus(userId, status, adminPrincipal));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs());
    }
}

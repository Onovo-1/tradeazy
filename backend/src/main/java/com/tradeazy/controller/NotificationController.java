package com.tradeazy.controller;

import com.tradeazy.dto.response.NotificationResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "List current user's notifications")
    public ResponseEntity<PagedResponse<NotificationResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(notificationService.listForUser(userId, page, size));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Count unread notifications (navbar badge)")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(userId)));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllRead() {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationService.markOneRead(id, userId);
        return ResponseEntity.noContent().build();
    }
}
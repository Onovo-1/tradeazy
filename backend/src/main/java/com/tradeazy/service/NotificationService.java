package com.tradeazy.service;

import com.tradeazy.dto.response.NotificationResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.entity.Notification;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.NotificationType;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.repository.NotificationRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Creates a notification for the given user.
     * Silently fails if the recipient doesn't exist or is the actor (self-notification).
     */
    @Transactional
    public void notify(Long userId, Long actorId, NotificationType type,
                       String title, String content, Long referenceId, String link) {
        if (userId == null) return;
        if (actorId != null && userId.equals(actorId)) return; // skip self-notifications

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Cannot notify — user {} not found", userId);
            return;
        }

        Notification n = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .content(content)
                .referenceId(referenceId)
                .link(link)
                .read(false)
                .build();

        notificationRepository.save(n);
        log.info("Notification sent to user {}: {}", userId, title);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> listForUser(Long userId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Notification> p = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationResponse> content = p.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PagedResponse.<NotificationResponse>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    @Transactional
    public void markOneRead(Long id, Long userId) {
        notificationRepository.markOneRead(id, userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .content(n.getContent())
                .referenceId(n.getReferenceId())
                .link(n.getLink())
                .read(n.getRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
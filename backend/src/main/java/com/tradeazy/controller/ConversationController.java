package com.tradeazy.controller;

import com.tradeazy.dto.request.StartConversationRequest;
import com.tradeazy.dto.response.ChatSummaryResponse;
import com.tradeazy.dto.response.ConversationResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversations", description = "Buyer ↔ Seller chat threads")
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    @Operation(summary = "Start (or get existing) conversation about a product")
    public ResponseEntity<ConversationResponse> start(
            @Valid @RequestBody StartConversationRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.start(userId, request.getProductId()));
    }

    @GetMapping
    @Operation(summary = "List the current user's conversations")
    public ResponseEntity<PagedResponse<ConversationResponse>> list(
            @RequestParam(defaultValue = "false") boolean unread,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(conversationService.listForUser(userId, unread, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one conversation")
    public ResponseEntity<ConversationResponse> get(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(conversationService.get(id, userId));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark all messages in this conversation as read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        conversationService.markRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Total conversations with unread messages (navbar badge)")
    public ResponseEntity<ChatSummaryResponse> unreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = conversationService.countUnread(userId);
        return ResponseEntity.ok(ChatSummaryResponse.builder().unreadConversations(count).build());
    }
}
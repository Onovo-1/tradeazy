package com.tradeazy.controller;

import com.tradeazy.dto.request.SendMessageRequest;
import com.tradeazy.dto.response.MessageResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Messages within a conversation")
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    @Operation(summary = "List messages in a conversation (oldest first)")
    public ResponseEntity<PagedResponse<MessageResponse>> list(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(messageService.list(conversationId, userId, page, size));
    }

    @PostMapping
    @Operation(summary = "Send a message")
    public ResponseEntity<MessageResponse> send(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        MessageResponse created = messageService.send(conversationId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
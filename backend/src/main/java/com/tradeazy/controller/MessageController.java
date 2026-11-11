package com.tradeazy.controller;

import com.tradeazy.dto.request.MessageRequest;
import com.tradeazy.dto.response.MessageResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.FileStorageService;
import com.tradeazy.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Chat messages within a conversation")
public class MessageController {

    private final MessageService messageService;
    private final FileStorageService fileStorageService;

    @GetMapping
    @Operation(summary = "Get messages in a conversation")
    public ResponseEntity<PagedResponse<MessageResponse>> list(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(messageService.list(conversationId, userId, page, size));
    }

    @PostMapping
    @Operation(summary = "Send a message")
    public ResponseEntity<MessageResponse> send(
            @PathVariable Long conversationId,
            @Valid @RequestBody MessageRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.send(conversationId, userId, request.getContent()));
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload an image for a message")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable Long conversationId,
            @RequestParam("file") MultipartFile file
    ) {
        // Save the file using the existing storage service
        String imageUrl = fileStorageService.store(file, "chat");
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }

    @PutMapping("/{messageId}")
    @Operation(summary = "Edit a message")
    public ResponseEntity<MessageResponse> edit(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @Valid @RequestBody MessageRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(messageService.edit(conversationId, messageId, userId, request.getContent()));
    }

    @DeleteMapping("/{messageId}")
    @Operation(summary = "Delete a message")
    public ResponseEntity<Void> delete(
            @PathVariable Long conversationId,
            @PathVariable Long messageId
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        messageService.delete(conversationId, messageId, userId);
        return ResponseEntity.noContent().build();
    }
}
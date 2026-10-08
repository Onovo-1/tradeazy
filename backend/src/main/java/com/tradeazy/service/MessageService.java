package com.tradeazy.service;

import com.tradeazy.dto.request.SendMessageRequest;
import com.tradeazy.dto.response.MessageResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.entity.Conversation;
import com.tradeazy.entity.Message;
import com.tradeazy.entity.User;
import com.tradeazy.exception.ForbiddenException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.repository.ConversationRepository;
import com.tradeazy.repository.MessageRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    private static final int MAX_PAGE_SIZE = 200;

    // ============================================================
    // SEND
    // ============================================================
    @Transactional
    public MessageResponse send(Long conversationId, Long senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getBuyer().getId().equals(senderId)
                && !conversation.getSeller().getId().equals(senderId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent().trim())
                .read(false)
                .build();

        Message saved = messageRepository.save(message);

        // bump conversation activity timestamp
        conversation.setLastMessageAt(saved.getCreatedAt());
        conversationRepository.save(conversation);

        log.info("Message sent: id={}, conversation={}, sender={}",
                saved.getId(), conversationId, senderId);

        return toResponse(saved);
    }

    // ============================================================
    // LIST messages in a conversation
    // ============================================================
    @Transactional(readOnly = true)
    public PagedResponse<MessageResponse> list(Long conversationId, Long userId, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getBuyer().getId().equals(userId)
                && !conversation.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }

        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Message> messages = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, pageable);

        List<MessageResponse> content = messages.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PagedResponse.<MessageResponse>builder()
                .content(content)
                .page(messages.getNumber())
                .size(messages.getSize())
                .totalElements(messages.getTotalElements())
                .totalPages(messages.getTotalPages())
                .last(messages.isLast())
                .build();
    }

    // ============================================================
    // Mapper
    // ============================================================
    private MessageResponse toResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderUsername(m.getSender().getUsername())
                .content(m.getContent())
                .read(m.getRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
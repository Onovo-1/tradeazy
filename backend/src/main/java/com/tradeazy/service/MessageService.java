package com.tradeazy.service;

import com.tradeazy.dto.request.MessageRequest;
import com.tradeazy.dto.response.MessageResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.entity.Conversation;
import com.tradeazy.entity.Message;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.NotificationType;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final int MAX_PAGE_SIZE = 200;

    @Transactional
    public MessageResponse send(Long conversationId, Long senderId, String content) {
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
                .content(content.trim())
                .read(false)
                .build();

        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(saved.getCreatedAt());
        conversationRepository.save(conversation);

        Long recipientId = conversation.getBuyer().getId().equals(senderId)
                ? conversation.getSeller().getId()
                : conversation.getBuyer().getId();

        notificationService.notify(
                recipientId, senderId, NotificationType.NEW_MESSAGE,
                "New message from " + sender.getFirstName(),
                truncate(saved.getContent(), 80), conversation.getId(),
                "/messages?c=" + conversation.getId()
        );

        return toResponse(saved);
    }

    @Transactional
    public MessageResponse edit(Long conversationId, Long messageId, Long userId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getConversation().getId().equals(conversationId)) {
            throw new ForbiddenException("Message does not belong to this conversation");
        }
        if (!message.getSender().getId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own messages");
        }

        message.setContent(newContent.trim());
        Message saved = messageRepository.save(message);
        log.info("Message {} edited by user {}", messageId, userId);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long conversationId, Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getConversation().getId().equals(conversationId)) {
            throw new ForbiddenException("Message does not belong to this conversation");
        }
        if (!message.getSender().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own messages");
        }

        messageRepository.delete(message);
        log.info("Message {} deleted by user {}", messageId, userId);
    }

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

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }
}
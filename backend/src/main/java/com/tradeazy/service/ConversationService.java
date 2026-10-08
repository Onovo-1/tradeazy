package com.tradeazy.service;

import com.tradeazy.dto.response.ConversationResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.entity.Conversation;
import com.tradeazy.entity.Message;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.User;
import com.tradeazy.exception.ForbiddenException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.repository.ConversationRepository;
import com.tradeazy.repository.MessageRepository;
import com.tradeazy.repository.ProductRepository;
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
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int PREVIEW_LENGTH = 60;

    // ============================================================
    // START (or return existing) conversation for a product
    // ============================================================
    @Transactional
    public ConversationResponse start(Long buyerId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        Long sellerId = product.getSeller().getId();

        if (sellerId.equals(buyerId)) {
            throw new InvalidOperationException("You cannot start a conversation with yourself");
        }

        return conversationRepository
                .findByBuyerIdAndSellerIdAndProductId(buyerId, sellerId, productId)
                .map(c -> toResponse(c, buyerId))
                .orElseGet(() -> {
                    User buyer = userRepository.findById(buyerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
                    User seller = userRepository.findById(sellerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

                    Conversation conversation = Conversation.builder()
                            .buyer(buyer)
                            .seller(seller)
                            .product(product)
                            .build();

                    Conversation saved = conversationRepository.save(conversation);
                    log.info("Conversation started: id={}, buyer={}, seller={}, product={}",
                            saved.getId(), buyerId, sellerId, productId);
                    return toResponse(saved, buyerId);
                });
    }

    // ============================================================
    // LIST for user — all or unread-only
    // ============================================================
    @Transactional(readOnly = true)
    public PagedResponse<ConversationResponse> listForUser(
            Long userId, boolean unreadOnly, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Conversation> conversations = unreadOnly
                ? conversationRepository.findUnreadForUser(userId, pageable)
                : conversationRepository.findAllForUser(userId, pageable);

        List<ConversationResponse> content = conversations.getContent().stream()
                .map(c -> toResponse(c, userId))
                .toList();

        return PagedResponse.<ConversationResponse>builder()
                .content(content)
                .page(conversations.getNumber())
                .size(conversations.getSize())
                .totalElements(conversations.getTotalElements())
                .totalPages(conversations.getTotalPages())
                .last(conversations.isLast())
                .build();
    }

    // ============================================================
    // SINGLE conversation
    // ============================================================
    @Transactional(readOnly = true)
    public ConversationResponse get(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!isParticipant(conversation, userId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }
        return toResponse(conversation, userId);
    }

    // ============================================================
    // UNREAD COUNT (navbar badge)
    // ============================================================
    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return conversationRepository.countUnreadForUser(userId);
    }

    // ============================================================
    // MARK READ
    // ============================================================
    @Transactional
    public void markRead(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!isParticipant(conversation, userId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }
        int updated = messageRepository.markConversationRead(conversationId, userId);
        if (updated > 0) {
            log.info("Marked {} messages read in conversation {} for user {}",
                    updated, conversationId, userId);
        }
    }

    // ============================================================
    // Helpers
    // ============================================================
    public boolean isParticipant(Conversation c, Long userId) {
        return c.getBuyer().getId().equals(userId) || c.getSeller().getId().equals(userId);
    }

    private ConversationResponse toResponse(Conversation c, Long currentUserId) {
        boolean currentIsBuyer = c.getBuyer().getId().equals(currentUserId);
        User peer = currentIsBuyer ? c.getSeller() : c.getBuyer();

        Message lastMsg = messageRepository
                .findFirstByConversationIdOrderByCreatedAtDesc(c.getId())
                .orElse(null);

        long unread = messageRepository.countUnreadInConversation(c.getId(), currentUserId);

        String preview = null;
        if (lastMsg != null) {
            String content = lastMsg.getContent();
            preview = content.length() > PREVIEW_LENGTH
                    ? content.substring(0, PREVIEW_LENGTH) + "…"
                    : content;
        }

        Product p = c.getProduct();
        String productImageUrl = null;
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            productImageUrl = p.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .orElse(p.getImages().get(0))
                    .getUrl();
        }

        return ConversationResponse.builder()
                .id(c.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productImageUrl(productImageUrl)
                .peerId(peer.getId())
                .peerUsername(peer.getUsername())
                .peerFirstName(peer.getFirstName())
                .peerLastName(peer.getLastName())
                .peerProfilePictureUrl(peer.getProfilePictureUrl())
                .role(currentIsBuyer ? "BUYER" : "SELLER")
                .lastMessagePreview(preview)
                .lastMessageAt(c.getLastMessageAt())
                .unreadCount(unread)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
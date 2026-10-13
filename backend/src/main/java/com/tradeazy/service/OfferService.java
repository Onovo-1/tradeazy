package com.tradeazy.service;

import com.tradeazy.dto.request.CounterOfferRequest;
import com.tradeazy.dto.request.OfferRequest;
import com.tradeazy.dto.response.OfferResponse;
import com.tradeazy.entity.Conversation;
import com.tradeazy.entity.Offer;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.OfferStatus;
import com.tradeazy.exception.ForbiddenException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.repository.ConversationRepository;
import com.tradeazy.repository.OfferRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferService {

    private final OfferRepository offerRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    /**
     * Computes the role of whoever made this offer based on the parent chain.
     * Even depth (0, 2, 4...) = BUYER. Odd depth = SELLER.
     */
    private String roleOf(Offer o) {
        int depth = 0;
        Offer cursor = o;
        while (cursor.getParentOffer() != null) {
            depth++;
            cursor = cursor.getParentOffer();
        }
        return (depth % 2 == 0) ? "BUYER" : "SELLER";
    }

    // ============================================================
    // CREATE — buyer makes an offer
    // ============================================================
    @Transactional
    public OfferResponse create(Long buyerId, OfferRequest request) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Force eager load
        conversation.getBuyer().getId();
        conversation.getSeller().getId();
        conversation.getProduct().getId();
        conversation.getProduct().getName();

        if (!conversation.getBuyer().getId().equals(buyerId)) {
            throw new ForbiddenException("Only the buyer can make an offer in this conversation");
        }

        Offer existing = offerRepository
                .findFirstByConversationIdAndStatusOrderByCreatedAtDesc(
                        conversation.getId(), OfferStatus.PENDING);
        if (existing != null) {
            throw new InvalidOperationException(
                    "There is already a pending offer in this conversation");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

        Offer offer = Offer.builder()
                .conversation(conversation)
                .product(conversation.getProduct())
                .buyer(buyer)
                .seller(conversation.getSeller())
                .amount(request.getAmount())
                .note(request.getNote())
                .status(OfferStatus.PENDING)
                .build();

        Offer saved = offerRepository.save(offer);
        log.info("Offer created: id={}, conv={}, buyer={}, amount={}",
                saved.getId(), conversation.getId(), buyerId, request.getAmount());
        return toResponse(saved, buyerId);
    }

    // ============================================================
    // ACCEPT — the counterparty of the last offer accepts
    // ============================================================
    @Transactional
    public OfferResponse accept(Long offerId, Long userId) {
        Offer offer = loadParticipant(offerId, userId);

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException(
                    "This offer is not pending; it's " + offer.getStatus().name());
        }

        String makerRole = roleOf(offer); // "BUYER" or "SELLER"
        boolean amBuyer = offer.getBuyer().getId().equals(userId);
        boolean amSeller = offer.getSeller().getId().equals(userId);

        // The counterparty is whoever did NOT make the offer
        boolean amCounterparty =
                (makerRole.equals("BUYER") && amSeller) ||
                (makerRole.equals("SELLER") && amBuyer);

        if (!amCounterparty) {
            throw new ForbiddenException("You cannot accept your own offer");
        }

        offer.setStatus(OfferStatus.ACCEPTED);
        Offer saved = offerRepository.save(offer);
        log.info("Offer {} accepted by user {} (role: {})", offerId, userId, amBuyer ? "BUYER" : "SELLER");
        return toResponse(saved, userId);
    }

    // ============================================================
    // REJECT
    // ============================================================
    @Transactional
    public OfferResponse reject(Long offerId, Long userId) {
        Offer offer = loadParticipant(offerId, userId);

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException(
                    "This offer is not pending; it's " + offer.getStatus().name());
        }

        String makerRole = roleOf(offer);
        boolean amBuyer = offer.getBuyer().getId().equals(userId);
        boolean amSeller = offer.getSeller().getId().equals(userId);

        boolean amCounterparty =
                (makerRole.equals("BUYER") && amSeller) ||
                (makerRole.equals("SELLER") && amBuyer);

        if (!amCounterparty) {
            throw new ForbiddenException("You cannot reject your own offer");
        }

        offer.setStatus(OfferStatus.REJECTED);
        Offer saved = offerRepository.save(offer);
        log.info("Offer {} rejected by user {}", offerId, userId);
        return toResponse(saved, userId);
    }

    // ============================================================
    // COUNTER — counterparty counters a pending offer
    // ============================================================
    @Transactional
    public OfferResponse counter(Long parentOfferId, Long userId, CounterOfferRequest request) {
        Offer parent = loadParticipant(parentOfferId, userId);

        if (parent.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException("Cannot counter an offer that isn't pending");
        }

        String makerRole = roleOf(parent);
        boolean amBuyer = parent.getBuyer().getId().equals(userId);
        boolean amSeller = parent.getSeller().getId().equals(userId);

        boolean amCounterparty =
                (makerRole.equals("BUYER") && amSeller) ||
                (makerRole.equals("SELLER") && amBuyer);

        if (!amCounterparty) {
            throw new ForbiddenException("You cannot counter your own offer");
        }

        // Close the parent
        parent.setStatus(OfferStatus.COUNTERED);
        offerRepository.save(parent);

        // Create the counter
        Offer counter = Offer.builder()
                .conversation(parent.getConversation())
                .product(parent.getProduct())
                .buyer(parent.getBuyer())
                .seller(parent.getSeller())
                .amount(request.getAmount())
                .note(request.getNote())
                .status(OfferStatus.PENDING)
                .parentOffer(parent)
                .build();

        Offer saved = offerRepository.save(counter);
        log.info("Counter offer {} created from parent {} by user {} (role: {})",
                saved.getId(), parentOfferId, userId, amBuyer ? "BUYER" : "SELLER");
        return toResponse(saved, userId);
    }

    // ============================================================
    // LIST
    // ============================================================
    @Transactional(readOnly = true)
    public List<OfferResponse> listByConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!conversation.getBuyer().getId().equals(userId)
                && !conversation.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }
        return offerRepository.findByConversationIdOrderByCreatedAtDesc(conversationId)
                .stream()
                .map(o -> toResponse(o, userId))
                .toList();
    }

    // ============================================================
    // Helpers
    // ============================================================
    private Offer loadParticipant(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + offerId));
        offer.getBuyer().getId();
        offer.getSeller().getId();
        offer.getProduct().getId();
        offer.getConversation().getId();
        if (!offer.getBuyer().getId().equals(userId)
                && !offer.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this offer");
        }
        return offer;
    }

    private OfferResponse toResponse(Offer o, Long currentUserId) {
        return OfferResponse.builder()
                .id(o.getId())
                .conversationId(o.getConversation().getId())
                .productId(o.getProduct().getId())
                .productName(o.getProduct().getName())
                .buyerId(o.getBuyer().getId())
                .buyerUsername(o.getBuyer().getUsername())
                .sellerId(o.getSeller().getId())
                .sellerUsername(o.getSeller().getUsername())
                .amount(o.getAmount())
                .status(o.getStatus().name())
                .parentOfferId(o.getParentOffer() != null ? o.getParentOffer().getId() : null)
                .note(o.getNote())
                .madeBy(roleOf(o))
                .createdAt(o.getCreatedAt())
                .build();
    }
}
package com.tradeazy.service;

import com.tradeazy.dto.request.CounterOfferRequest;
import com.tradeazy.dto.request.OfferRequest;
import com.tradeazy.dto.response.OfferResponse;
import com.tradeazy.entity.Conversation;
import com.tradeazy.entity.Offer;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.NotificationType;
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
    private final NotificationService notificationService;

    private String roleOf(Offer o) {
        int depth = 0;
        Offer cursor = o;
        while (cursor.getParentOffer() != null) {
            depth++;
            cursor = cursor.getParentOffer();
        }
        return (depth % 2 == 0) ? "BUYER" : "SELLER";
    }

    @Transactional
    public OfferResponse create(Long buyerId, OfferRequest request) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        conversation.getBuyer().getId();
        conversation.getSeller().getId();
        conversation.getProduct().getId();
        conversation.getProduct().getName();
        conversation.getProduct().getPrice();

        if (!conversation.getBuyer().getId().equals(buyerId)) {
            throw new ForbiddenException("Only the buyer can make an offer in this conversation");
        }

        Offer existing = offerRepository
                .findFirstByConversationIdAndStatusOrderByCreatedAtDesc(
                        conversation.getId(), OfferStatus.PENDING).orElse(null);
        if (existing != null) {
            throw new InvalidOperationException("There is already a pending offer in this conversation");
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

        notificationService.notify(
                conversation.getSeller().getId(),
                buyerId,
                NotificationType.NEW_OFFER,
                "New offer received",
                buyer.getFirstName() + " offered ₦" + request.getAmount() + " for " + conversation.getProduct().getName(),
                saved.getId(),
                "/messages?c=" + conversation.getId()
        );

        return toResponse(saved, buyerId);
    }

    @Transactional
    public OfferResponse createBuyNowOffer(Long conversationId, Long buyerId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        var product = conversation.getProduct();
        var effectivePrice = product.getEffectivePrice();
        var productName = product.getName();
        var seller = conversation.getSeller();
        var buyer = conversation.getBuyer();

        if (!buyer.getId().equals(buyerId)) {
            throw new ForbiddenException("Only the buyer can make an offer in this conversation");
        }

        Offer existing = offerRepository
                .findFirstByConversationIdAndStatusOrderByCreatedAtDesc(
                        conversation.getId(), OfferStatus.PENDING).orElse(null);
        if (existing != null) {
            throw new InvalidOperationException("There is already a pending offer in this conversation");
        }

        Offer offer = Offer.builder()
                .conversation(conversation)
                .product(product)
                .buyer(buyer)
                .seller(seller)
                .amount(effectivePrice)
                .note("I want to buy this at full price.")
                .status(OfferStatus.PENDING)
                .build();

        Offer saved = offerRepository.save(offer);
        log.info("Buy Now Offer created: id={}, conv={}, buyer={}, amount={}",
                saved.getId(), conversation.getId(), buyerId, saved.getAmount());

        notificationService.notify(
                seller.getId(),
                buyerId,
                NotificationType.NEW_OFFER,
                "Buy request received",
                buyer.getFirstName() + " wants to buy " + productName + " for " + effectivePrice,
                saved.getId(),
                "/messages?c=" + conversation.getId()
        );

        return toResponse(saved, buyerId);
    }

    @Transactional
    public OfferResponse update(Long offerId, Long userId, java.math.BigDecimal newAmount, String newNote) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        boolean isBuyer = offer.getBuyer().getId().equals(userId);
        boolean isSeller = offer.getSeller().getId().equals(userId);

        if (!isBuyer && !isSeller) {
            throw new ForbiddenException("You are not part of this offer");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException("Only pending offers can be edited");
        }

        offer.setAmount(newAmount);
        offer.setNote(newNote);
        
        Offer saved = offerRepository.save(offer);
        log.info("Offer {} updated by user {} to amount {}", offerId, userId, newAmount);

        return toResponse(saved, userId);
    }

    @Transactional
    public void delete(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        boolean isBuyer = offer.getBuyer().getId().equals(userId);
        boolean isSeller = offer.getSeller().getId().equals(userId);

        if (!isBuyer && !isSeller) {
            throw new ForbiddenException("You are not part of this offer");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException("Only pending offers can be deleted");
        }

        offerRepository.delete(offer);
        log.info("Offer {} deleted by user {}", offerId, userId);
    }

    @Transactional
    public OfferResponse accept(Long offerId, Long userId) {
        Offer offer = loadParticipant(offerId, userId);

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException("This offer is not pending; it's " + offer.getStatus().name());
        }

        String makerRole = roleOf(offer);
        boolean amBuyer = offer.getBuyer().getId().equals(userId);
        boolean amSeller = offer.getSeller().getId().equals(userId);

        boolean amCounterparty = (makerRole.equals("BUYER") && amSeller) || (makerRole.equals("SELLER") && amBuyer);

        if (!amCounterparty) {
            throw new ForbiddenException("You cannot accept your own offer");
        }

        offer.setStatus(OfferStatus.ACCEPTED);
        Offer saved = offerRepository.save(offer);
        log.info("Offer {} accepted by user {} (role: {})", offerId, userId, amBuyer ? "BUYER" : "SELLER");

        Long recipientId = makerRole.equals("BUYER") ? offer.getBuyer().getId() : offer.getSeller().getId();

        notificationService.notify(
                recipientId,
                userId,
                NotificationType.OFFER_ACCEPTED,
                "Offer accepted",
                "Your offer of ₦" + offer.getAmount() + " was accepted.",
                offer.getId(),
                "/messages?c=" + offer.getConversation().getId()
        );

        return toResponse(saved, userId);
    }

    @Transactional
    public OfferResponse reject(Long offerId, Long userId) {
        Offer offer = loadParticipant(offerId, userId);

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException("This offer is not pending; it's " + offer.getStatus().name());
        }

        String makerRole = roleOf(offer);
        boolean amBuyer = offer.getBuyer().getId().equals(userId);
        boolean amSeller = offer.getSeller().getId().equals(userId);

        boolean amCounterparty = (makerRole.equals("BUYER") && amSeller) || (makerRole.equals("SELLER") && amBuyer);

        if (!amCounterparty) {
            throw new ForbiddenException("You cannot reject your own offer");
        }

        offer.setStatus(OfferStatus.REJECTED);
        Offer saved = offerRepository.save(offer);
        log.info("Offer {} rejected by user {}", offerId, userId);

        Long recipientId = makerRole.equals("BUYER") ? offer.getBuyer().getId() : offer.getSeller().getId();

        notificationService.notify(
                recipientId,
                userId,
                NotificationType.OFFER_REJECTED,
                "Offer rejected",
                "Your offer of ₦" + offer.getAmount() + " was rejected.",
                offer.getId(),
                "/messages?c=" + offer.getConversation().getId()
        );

        return toResponse(saved, userId);
    }

    @Transactional
    public OfferResponse counter(Long parentOfferId, Long userId, CounterOfferRequest request) {
        Offer parent = loadParticipant(parentOfferId, userId);

        if (parent.getStatus() != OfferStatus.PENDING) {
            throw new InvalidOperationException("Cannot counter an offer that isn't pending");
        }

        String makerRole = roleOf(parent);
        boolean amBuyer = parent.getBuyer().getId().equals(userId);
        boolean amSeller = parent.getSeller().getId().equals(userId);

        boolean amCounterparty = (makerRole.equals("BUYER") && amSeller) || (makerRole.equals("SELLER") && amBuyer);

        if (!amCounterparty) {
            throw new ForbiddenException("You cannot counter your own offer");
        }

        parent.setStatus(OfferStatus.COUNTERED);
        offerRepository.save(parent);

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

        Long recipientId = amBuyer ? parent.getSeller().getId() : parent.getBuyer().getId();

        notificationService.notify(
                recipientId,
                userId,
                NotificationType.OFFER_COUNTERED,
                "Counter offer received",
                "You received a counter offer of ₦" + request.getAmount() + ".",
                saved.getId(),
                "/messages?c=" + parent.getConversation().getId()
        );

        return toResponse(saved, userId);
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> listByConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!conversation.getBuyer().getId().equals(userId) && !conversation.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this conversation");
        }
        return offerRepository.findByConversationIdOrderByCreatedAtDesc(conversationId)
                .stream()
                .map(o -> toResponse(o, userId))
                .toList();
    }

    private Offer loadParticipant(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + offerId));
        offer.getBuyer().getId();
        offer.getSeller().getId();
        offer.getProduct().getId();
        offer.getConversation().getId();
        if (!offer.getBuyer().getId().equals(userId) && !offer.getSeller().getId().equals(userId)) {
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
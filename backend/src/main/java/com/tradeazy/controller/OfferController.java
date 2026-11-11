package com.tradeazy.controller;

import com.tradeazy.dto.request.CounterOfferRequest;
import com.tradeazy.dto.request.OfferRequest;
import com.tradeazy.dto.response.OfferResponse;
import com.tradeazy.dto.response.OrderResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.OfferService;
import com.tradeazy.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Tag(name = "Offers", description = "Buyer ↔ Seller price negotiation")
public class OfferController {

    private final OfferService offerService;
    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Buyer makes an offer")
    public ResponseEntity<OfferResponse> create(@Valid @RequestBody OfferRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(offerService.create(userId, request));
    }

    @PostMapping("/buy-now")
    @Operation(summary = "Buyer clicks Buy Now - creates a full price offer")
    public ResponseEntity<OfferResponse> createBuyNowOffer(@RequestParam Long conversationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(offerService.createBuyNowOffer(conversationId, userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a pending offer")
    public ResponseEntity<OfferResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CounterOfferRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(offerService.update(id, userId, request.getAmount(), request.getNote()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a pending offer")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        offerService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/accept")
    @Operation(summary = "Accept an offer")
    public ResponseEntity<OfferResponse> accept(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(offerService.accept(id, userId));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject an offer")
    public ResponseEntity<OfferResponse> reject(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(offerService.reject(id, userId));
    }

    @PostMapping("/{id}/counter")
    @Operation(summary = "Counter an offer (seller or buyer)")
    public ResponseEntity<OfferResponse> counter(
            @PathVariable Long id,
            @Valid @RequestBody CounterOfferRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(offerService.counter(id, userId, request));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Buyer pays for an accepted offer (creates order)")
    public ResponseEntity<OrderResponse> pay(@PathVariable Long id) {
        Long buyerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createFromOffer(id, buyerId));
    }

    @GetMapping("/conversation/{conversationId}")
    @Operation(summary = "List offers in a conversation")
    public ResponseEntity<List<OfferResponse>> list(@PathVariable Long conversationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(offerService.listByConversation(conversationId, userId));
    }
}
package com.tradeazy.controller;

import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.SubscriptionResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "Seller Rent / subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * GET /api/subscriptions/prices — public pricing info for the UI.
     * No @PreAuthorize — URL matcher in SecurityConfig permits it.
     */
    @GetMapping("/prices")
    @Operation(summary = "Get Rent pricing plans")
    public ResponseEntity<Map<String, Object>> prices() {
        return ResponseEntity.ok(Map.of(
                "MONTHLY",   Map.of("price", SubscriptionService.MONTHLY_PRICE,   "days", 30),
                "QUARTERLY", Map.of("price", SubscriptionService.QUARTERLY_PRICE, "days", 90),
                "YEARLY",    Map.of("price", SubscriptionService.YEARLY_PRICE,    "days", 365)
        ));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Get the current seller's active Rent subscription")
    public ResponseEntity<SubscriptionResponse> me() {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.getCurrent(sellerId));
    }

    @PostMapping("/renew")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Renew Rent (mock payment in dev)")
    public ResponseEntity<SubscriptionResponse> renew(
            @RequestParam(defaultValue = "MONTHLY") String plan
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.renew(sellerId, plan));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "List the seller's subscription history")
    public ResponseEntity<PagedResponse<SubscriptionResponse>> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.history(sellerId, page, size));
    }
}
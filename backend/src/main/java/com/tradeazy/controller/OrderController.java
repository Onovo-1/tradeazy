package com.tradeazy.controller;

import com.tradeazy.dto.request.CreateOrderRequest;
import com.tradeazy.dto.request.UpdateOrderStatusRequest;
import com.tradeazy.dto.response.OrderResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Buyer purchases and seller order management")
public class OrderController {

    private final OrderService orderService;

    // ------------------------------------------------------------
    // Buyer creates order
    // ------------------------------------------------------------
    @PostMapping
    @Operation(summary = "Create a new order (buyer only)")
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        Long buyerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.create(buyerId, request));
    }

    // ------------------------------------------------------------
    // Buyer's own orders
    // ------------------------------------------------------------
    @GetMapping("/mine")
    @Operation(summary = "List the current buyer's orders")
    public ResponseEntity<PagedResponse<OrderResponse>> listMine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long buyerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(orderService.listForBuyer(buyerId, page, size));
    }

    // ------------------------------------------------------------
    // Seller's incoming orders
    // ------------------------------------------------------------
    @GetMapping("/seller")
    @Operation(summary = "List orders received by the current seller")
    public ResponseEntity<PagedResponse<OrderResponse>> listSeller(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(orderService.listForSeller(sellerId, page, size));
    }

    // ------------------------------------------------------------
    // Single order (buyer OR seller)
    // ------------------------------------------------------------
    @GetMapping("/{id}")
    @Operation(summary = "Get one order (buyer or seller of that order)")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(orderService.get(id, userId));
    }

    // ------------------------------------------------------------
    // Seller updates status
    // ------------------------------------------------------------
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status (seller only)")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(orderService.updateStatus(id, sellerId, request.getStatus()));
    }

    // ------------------------------------------------------------
    // Buyer cancels own order
    // ------------------------------------------------------------
    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a PENDING order (buyer only)")
    public ResponseEntity<OrderResponse> cancel(@PathVariable Long id) {
        Long buyerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(orderService.cancel(id, buyerId));
    }
}
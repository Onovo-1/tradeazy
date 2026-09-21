package com.tradeazy.controller;

import com.tradeazy.dto.request.ProductRequest;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.ProductResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Product REST API.
 *
 * Public endpoints: browse + view details (no auth).
 * Seller endpoints: create/update/delete/mark-sold (requires SELLER role,
 *                  plus ownership check in ProductService).
 *
 * IMPORTANT: The seller ID never comes from the request — it's always
 * derived from the JWT via SecurityUtils.getCurrentUserId(). This prevents
 * IDOR (Insecure Direct Object Reference) attacks.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Browse, create, and manage product listings")
public class ProductController {

    private final ProductService productService;

    // ============================================================
    // PUBLIC — browse and details
    // ============================================================

    @GetMapping
    @Operation(summary = "List all active products (paginated, sortable)")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        return ResponseEntity.ok(productService.listActive(page, size, sort));
    }

    @GetMapping("/category/{slug}")
    @Operation(summary = "List active products in a category")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> listByCategory(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        return ResponseEntity.ok(productService.listByCategory(slug, page, size, sort));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public product details (increments view count)")
    public ResponseEntity<ProductResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getPublicDetail(id));
    }

    // ============================================================
    // SELLER — CRUD
    // ============================================================

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Create a new product (seller only, requires active Rent)")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        ProductResponse created = productService.create(request, sellerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Update a product (owner only)")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productService.update(id, request, sellerId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Soft-delete a product (owner only)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        productService.delete(id, sellerId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/sold")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Mark a product as SOLD (owner only)")
    public ResponseEntity<ProductResponse> markAsSold(@PathVariable Long id) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productService.markAsSold(id, sellerId));
    }

    // ============================================================
    // SELLER — own listings
    // ============================================================

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "List the current seller's products (all statuses)")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> listMine(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productService.listMyProducts(sellerId, page, size, sort));
    }

    @GetMapping("/mine/{id}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "View one of the current seller's products (any status)")
    public ResponseEntity<ProductResponse> getMine(@PathVariable Long id) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productService.getOwnedDetail(id, sellerId));
    }
}
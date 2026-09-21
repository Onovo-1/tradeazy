package com.tradeazy.controller;

import com.tradeazy.dto.response.ProductImageResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.ProductImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/images")
@RequiredArgsConstructor
@Tag(name = "Product Images", description = "Upload and manage product images")
public class ProductImageController {

    private final ProductImageService productImageService;

    // ------------------------------------------------------------
    // Public — anyone can list images for a product
    // ------------------------------------------------------------
    @GetMapping
    @Operation(summary = "List images for a product")
    public ResponseEntity<List<ProductImageResponse>> list(@PathVariable Long productId) {
        return ResponseEntity.ok(productImageService.list(productId));
    }

    // ------------------------------------------------------------
    // Seller — upload
    // ------------------------------------------------------------
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Upload an image for a product (multipart, seller owner only)")
    public ResponseEntity<ProductImageResponse> upload(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        ProductImageResponse uploaded = productImageService.upload(productId, file, sellerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    // ------------------------------------------------------------
    // Seller — delete
    // ------------------------------------------------------------
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Delete an image (seller owner only)")
    public ResponseEntity<Void> delete(
            @PathVariable Long productId,
            @PathVariable Long imageId
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        productImageService.delete(productId, imageId, sellerId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------
    // Seller — set primary
    // ------------------------------------------------------------
    @PatchMapping("/{imageId}/primary")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Set an image as the primary/cover (seller owner only)")
    public ResponseEntity<ProductImageResponse> setPrimary(
            @PathVariable Long productId,
            @PathVariable Long imageId
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productImageService.setPrimary(productId, imageId, sellerId));
    }
}
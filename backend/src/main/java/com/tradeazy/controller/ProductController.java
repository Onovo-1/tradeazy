package com.tradeazy.controller;

import com.tradeazy.dto.request.ProductRequest;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.ProductResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.entity.Category;
import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.repository.CategoryRepository;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.FileStorageService;
import com.tradeazy.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Browse and manage products")
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @GetMapping
    @Operation(summary = "List all active products or search")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ProductCondition condition
    ) {
        // Resolve the category (slug OR id) to a list of category IDs (parent + children)
        Category cat = null;
        if (category != null && !category.isBlank()) {
            cat = categoryRepository.findBySlug(category).orElse(null);
        } else if (categoryId != null) {
            cat = categoryRepository.findById(categoryId).orElse(null);
        }

        // Build the list of category IDs (parent + children) — this must be final for use in lambda below
        List<Long> categoryIds;
        if (cat != null) {
            List<Long> ids = new ArrayList<>();
            ids.add(cat.getId());
            if (cat.getChildren() != null) {
                for (Category child : cat.getChildren()) {
                    ids.add(child.getId());
                }
            }
            categoryIds = ids;
        } else {
            categoryIds = null;
        }

        // If ANY filter is provided, use the search logic
        if ((q != null && !q.isBlank()) || condition != null || minPrice != null || maxPrice != null || location != null || categoryIds != null) {
            return ResponseEntity.ok(productService.search(
                    q, categoryIds, minPrice, maxPrice, location, condition, page, size, sort
            ));
        }

        // Otherwise, just list active products
        return ResponseEntity.ok(productService.listActive(page, size, sort));
    }

    @GetMapping("/category/{slug}")
    @Operation(summary = "List active products by category")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> listByCategory(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(productService.listByCategory(slug, page, size, sort));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getPublicDetail(id));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Get the logged-in seller's products")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> listMyProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String sort
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productService.listMyProducts(sellerId, page, size, sort));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Create a new product listing")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request, sellerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Update a product listing")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productService.update(id, request, sellerId));
    }

    @PatchMapping("/{id}/sell")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Decrement quantity by 1 (mark as sold)")
    public ResponseEntity<ProductResponse> markSold(@PathVariable Long id) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(productService.markAsSold(id, sellerId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Delete a product listing")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        productService.delete(id, sellerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/images")
    @Operation(summary = "Get all images for a product")
    public ResponseEntity<List<String>> getProductImages(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductImageUrls(id));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Upload an image for a product")
    public ResponseEntity<Void> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        productService.addImageToProduct(id, sellerId, file);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Upload a standalone image (e.g., for chat)")
    public ResponseEntity<Map<String, String>> uploadStandaloneImage(
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = fileStorageService.store(file, "chat");
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }

    @PatchMapping("/{id}/images/{imageId}/primary")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Set an image as the primary image")
    public ResponseEntity<Void> setPrimaryImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        productService.setPrimaryImage(id, sellerId, imageId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Delete an image")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        productService.deleteImage(id, sellerId, imageId);
        return ResponseEntity.noContent().build();
    }
}
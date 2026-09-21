package com.tradeazy.service;

import com.tradeazy.dto.response.ProductImageResponse;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.ProductImage;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.exception.ForbiddenException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.repository.ProductImageRepository;
import com.tradeazy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Business logic for product images.
 *
 * Rules enforced:
 *   1. Only the product's owner can upload/delete images.
 *   2. Max 5 images per product.
 *   3. First image uploaded becomes primary automatically.
 *   4. Deleting the primary promotes the next image (if any) to primary.
 *   5. Files are deleted from disk when their DB record is removed.
 *   6. Cannot upload images for SOLD or REMOVED products.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImageService {

    private static final int MAX_IMAGES_PER_PRODUCT = 5;

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final FileStorageService fileStorageService;

    // ============================================================
    // UPLOAD
    // ============================================================
    @Transactional
    public ProductImageResponse upload(Long productId, MultipartFile file, Long sellerId) {

        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        if (product.getStatus() == ProductStatus.SOLD
                || product.getStatus() == ProductStatus.REMOVED) {
            throw new InvalidOperationException("Cannot upload images to a " + product.getStatus() + " product");
        }

        long existing = imageRepository.countByProductId(productId);
        if (existing >= MAX_IMAGES_PER_PRODUCT) {
            throw new InvalidOperationException(
                    "Maximum " + MAX_IMAGES_PER_PRODUCT + " images per product"
            );
        }

        // Store file on disk
        String url = fileStorageService.store(file, "products");

        // First image becomes primary automatically
        boolean shouldBePrimary = existing == 0;

        ProductImage image = ProductImage.builder()
                .url(url)
                .displayOrder((int) existing)
                .isPrimary(shouldBePrimary)
                .product(product)
                .build();

        ProductImage saved = imageRepository.save(image);
        log.info("Image uploaded: productId={}, imageId={}, url={}", productId, saved.getId(), url);

        return toResponse(saved);
    }

    // ============================================================
    // DELETE
    // ============================================================
    @Transactional
    public void delete(Long productId, Long imageId, Long sellerId) {
        // Ownership check via the product
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        ProductImage image = imageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());

        // Delete DB row first, then physical file
        imageRepository.delete(image);
        fileStorageService.delete(image.getUrl());

        // If the deleted image was primary, promote the next one
        if (wasPrimary) {
            List<ProductImage> remaining = imageRepository.findByProductIdOrdered(productId);
            if (!remaining.isEmpty()) {
                ProductImage newPrimary = remaining.get(0);
                newPrimary.setIsPrimary(true);
                imageRepository.save(newPrimary);
                log.info("Promoted image {} to primary for product {}", newPrimary.getId(), productId);
            }
        }

        log.info("Image deleted: productId={}, imageId={}", productId, imageId);
    }

    // ============================================================
    // SET PRIMARY
    // ============================================================
    @Transactional
    public ProductImageResponse setPrimary(Long productId, Long imageId, Long sellerId) {
        // Ownership check
        productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        ProductImage image = imageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

        // Clear current primary
        imageRepository.findByProductIdAndIsPrimaryTrue(productId)
                .ifPresent(current -> {
                    if (!current.getId().equals(image.getId())) {
                        current.setIsPrimary(false);
                        imageRepository.save(current);
                    }
                });

        // Set new primary
        image.setIsPrimary(true);
        ProductImage saved = imageRepository.save(image);
        log.info("Image {} set as primary for product {}", imageId, productId);

        return toResponse(saved);
    }

    // ============================================================
    // LIST
    // ============================================================
    @Transactional(readOnly = true)
    public List<ProductImageResponse> list(Long productId) {
        return imageRepository.findByProductIdOrdered(productId)
                .stream()
                .map(ProductImageService::toResponse)
                .toList();
    }

    // ============================================================
    // MAPPER
    // ============================================================
    private static ProductImageResponse toResponse(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .url(image.getUrl())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .build();
    }
}
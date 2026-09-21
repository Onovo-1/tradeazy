package com.tradeazy.mapper;

import com.tradeazy.dto.response.CategoryResponse;
import com.tradeazy.dto.response.ProductImageResponse;
import com.tradeazy.dto.response.ProductResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.ProductImage;

import java.util.Comparator;
import java.util.List;

/**
 * Converts Product entities into the DTOs the API exposes.
 *
 * IMPORTANT: The caller must be inside a @Transactional method.
 * Product.images is LAZY, and accessing it outside a session throws
 * LazyInitializationException. Services handle this by being @Transactional.
 */
public final class ProductMapper {

    private ProductMapper() {
        // utility class
    }

    // ============================================================
    // Full product response (details page)
    // ============================================================
    public static ProductResponse toResponse(Product product) {
        if (product == null) return null;

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .effectivePrice(product.getEffectivePrice())
                .discountPercent(product.getDiscountPercent())
                .quantity(product.getQuantity())
                .condition(product.getCondition())
                .status(product.getStatus())
                .location(product.getLocation())
                .specifications(product.getSpecifications())
                .viewCount(product.getViewCount())
                .favoriteCount(product.getFavoriteCount())
                .category(CategoryMapper.toResponse(product.getCategory()))
                .images(mapImages(product.getImages()))
                .seller(mapSeller(product))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    // ============================================================
    // Summary response (list cards)
    // ============================================================
    public static ProductSummaryResponse toSummary(Product product) {
        if (product == null) return null;

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .effectivePrice(product.getEffectivePrice())
                .discountPercent(product.getDiscountPercent())
                .condition(product.getCondition())
                .status(product.getStatus())
                .location(product.getLocation())
                .primaryImageUrl(findPrimaryImageUrl(product.getImages()))
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerUsername(product.getSeller() != null ? product.getSeller().getUsername() : null)
                .createdAt(product.getCreatedAt())
                .build();
    }

    // ============================================================
    // Helpers
    // ============================================================

    private static List<ProductImageResponse> mapImages(List<ProductImage> images) {
        if (images == null || images.isEmpty()) return List.of();
        return images.stream()
                .sorted(Comparator
                        .comparing(ProductImage::getIsPrimary).reversed()
                        .thenComparing(ProductImage::getDisplayOrder))
                .map(img -> ProductImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .isPrimary(img.getIsPrimary())
                        .displayOrder(img.getDisplayOrder())
                        .build())
                .toList();
    }

    /**
     * Returns the primary image URL, or the first image if none is marked primary.
     * Returns null if there are no images at all.
     */
    private static String findPrimaryImageUrl(List<ProductImage> images) {
        if (images == null || images.isEmpty()) return null;
        return images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .or(() -> images.stream().findFirst())
                .map(ProductImage::getUrl)
                .orElse(null);
    }

    private static ProductResponse.SellerSummary mapSeller(Product product) {
        if (product.getSeller() == null) return null;
        var seller = product.getSeller();
        return ProductResponse.SellerSummary.builder()
                .id(seller.getId())
                .username(seller.getUsername())
                .firstName(seller.getFirstName())
                .lastName(seller.getLastName())
                .profilePictureUrl(seller.getProfilePictureUrl())
                .location(seller.getLocation())
                .build();
    }
}
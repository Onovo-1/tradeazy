package com.tradeazy.dto.response;

import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Full product view — used by:
 *   - GET /api/products/{id}          (details page)
 *   - POST /api/products              (create response)
 *   - PUT  /api/products/{id}         (update response)
 *   - Seller dashboard (own products)
 *
 * Includes seller summary (not the full UserResponse — no email/phone here;
 * that's only exposed to the seller themselves via /api/auth/me).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal effectivePrice;   // after discount
    private Integer discountPercent;
    private Integer quantity;
    private ProductCondition condition;
    private ProductStatus status;
    private String location;
    private String specifications;
    private Long viewCount;
    private Long favoriteCount;

    // Nested
    private CategoryResponse category;
    private List<ProductImageResponse> images;
    private SellerSummary seller;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    /**
     * Minimal public seller info — no email/phone.
     * The full seller profile (with contact) is only revealed after
     * the buyer initiates a chat (Phase 7).
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SellerSummary {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
        private String profilePictureUrl;
        private String location;
    }
}
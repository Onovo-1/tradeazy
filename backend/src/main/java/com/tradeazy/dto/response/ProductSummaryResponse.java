package com.tradeazy.dto.response;

import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Compact product view for list pages (search results, home page, seller's list).
 *
 * Cheaper than ProductResponse:
 *   - Only the primary image URL, not the full gallery
 *   - Only category name + slug, not the full CategoryResponse
 *   - No specifications, description, or view counts
 *
 * The frontend uses ProductSummaryResponse everywhere it renders a card.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private BigDecimal effectivePrice;
    private Integer discountPercent;
    private ProductCondition condition;
    private ProductStatus status;
    private String location;

    private String primaryImageUrl;      // null if no images
    private String categoryName;
    private String categorySlug;

    private Long sellerId;
    private String sellerUsername;

    private OffsetDateTime createdAt;
}
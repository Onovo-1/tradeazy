package com.tradeazy.dto.response;

import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
    private Integer quantity;
    private Integer soldCount; // ADDED
    private String primaryImageUrl;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private Long sellerId;
    private String sellerUsername;
    private OffsetDateTime createdAt;
}
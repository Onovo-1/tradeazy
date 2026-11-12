package com.tradeazy.dto.response;

import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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
    private BigDecimal effectivePrice;
    private Integer discountPercent;
    private Integer quantity; // CHANGED TO INTEGER
    private ProductCondition condition;
    private ProductStatus status;
    private String location;
    private String specifications;
    private Integer viewCount;
    private Integer favoriteCount;
    private CategoryResponse category;
    private List<ProductImageResponse> images;
    private SellerSummary seller;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

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
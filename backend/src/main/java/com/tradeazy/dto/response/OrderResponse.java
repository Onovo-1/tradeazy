package com.tradeazy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;

    // Product snapshot
    private Long productId;
    private String productName;
    private String productImageUrl;

    // Parties (only the "peer" is shown to the current user)
    private Long buyerId;
    private String buyerUsername;
    private String buyerFirstName;
    private String buyerLastName;

    private Long sellerId;
    private String sellerUsername;
    private String sellerFirstName;
    private String sellerLastName;

    // Order details
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;

    private String status;
    private String paymentStatus;
    private String paymentReference;
    private String notes;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
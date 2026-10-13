package com.tradeazy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferResponse {

    private Long id;
    private Long conversationId;
    private Long productId;
    private String productName;

    private Long buyerId;
    private String buyerUsername;

    private Long sellerId;
    private String sellerUsername;

    private BigDecimal amount;
    private String status;
    private Long parentOfferId;
    private String note;

    /** "BUYER" or "SELLER" — who made this offer. */
    private String madeBy;

    private OffsetDateTime createdAt;
}
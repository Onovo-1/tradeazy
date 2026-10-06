package com.tradeazy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponse {

    private Long id;
    private String plan;
    private BigDecimal amount;
    private OffsetDateTime startDate;
    private OffsetDateTime expiryDate;
    private String status;
    private String paymentStatus;
    private String transactionReference;
    private long daysRemaining;
    private OffsetDateTime createdAt;
}
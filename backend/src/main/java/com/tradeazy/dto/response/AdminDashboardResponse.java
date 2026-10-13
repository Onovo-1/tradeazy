package com.tradeazy.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalBuyers;
    private long totalSellers;
    private long totalAdmins;

    private long totalProducts;
    private long activeProducts;
    private long soldProducts;
    private long removedProducts;

    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private BigDecimal totalRevenue;

    private long activeSubscriptions;
    private long expiredSubscriptions;
    private BigDecimal subscriptionRevenue;

    private long totalConversations;
    private long totalOffers;
    private long totalFavorites;
}
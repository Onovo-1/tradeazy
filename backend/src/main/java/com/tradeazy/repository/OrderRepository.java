package com.tradeazy.repository;

import com.tradeazy.entity.Order;
import com.tradeazy.entity.enums.OrderPaymentStatus;
import com.tradeazy.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);
    Page<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);
    Page<Order> findBySellerIdAndStatusOrderByCreatedAtDesc(Long sellerId, OrderStatus status, Pageable pageable);
    Page<Order> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, OrderStatus status, Pageable pageable);

    boolean existsByIdAndBuyerId(Long id, Long buyerId);
    boolean existsByIdAndSellerId(Long id, Long sellerId);

    long countBySellerId(Long sellerId);
    long countBySellerIdAndStatus(Long sellerId, OrderStatus status);
    long countByBuyerId(Long buyerId);

    // --- Admin helpers ---
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = :paid")
    BigDecimal sumTotalPaid(@Param("paid") OrderPaymentStatus paid);

    default BigDecimal sumTotalPaid() {
        return sumTotalPaid(OrderPaymentStatus.PAID);
    }
}
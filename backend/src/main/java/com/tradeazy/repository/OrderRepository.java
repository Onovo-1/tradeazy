package com.tradeazy.repository;

import com.tradeazy.entity.Order;
import com.tradeazy.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Buyer's orders
    Page<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

    // Seller's orders
    Page<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    // Seller's orders filtered by status
    Page<Order> findBySellerIdAndStatusOrderByCreatedAtDesc(
            Long sellerId, OrderStatus status, Pageable pageable);

    // Buyer's orders filtered by status
    Page<Order> findByBuyerIdAndStatusOrderByCreatedAtDesc(
            Long buyerId, OrderStatus status, Pageable pageable);

    // Ownership check
    boolean existsByIdAndBuyerId(Long id, Long buyerId);
    boolean existsByIdAndSellerId(Long id, Long sellerId);

    // Stats
    long countBySellerId(Long sellerId);
    long countBySellerIdAndStatus(Long sellerId, OrderStatus status);
    long countByBuyerId(Long buyerId);
}
package com.tradeazy.repository;

import com.tradeazy.entity.Subscription;
import com.tradeazy.entity.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findFirstBySellerIdAndStatusOrderByExpiryDateDesc(
            Long sellerId, SubscriptionStatus status);

    Page<Subscription> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    @Query("""
        SELECT COUNT(s) > 0 FROM Subscription s
        WHERE s.seller.id = :sellerId
          AND s.status = 'ACTIVE'
          AND s.expiryDate > :now
    """)
    boolean hasActiveRent(@Param("sellerId") Long sellerId, @Param("now") OffsetDateTime now);

    @Query("""
        SELECT s FROM Subscription s
        WHERE s.status = 'ACTIVE'
          AND s.expiryDate <= :now
    """)
    List<Subscription> findExpiredActiveSubscriptions(@Param("now") OffsetDateTime now);

    long countByStatus(SubscriptionStatus status);

    // --- Admin helpers ---
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Subscription s WHERE s.paymentStatus = 'PAID'")
    BigDecimal sumPaidAmount();
}
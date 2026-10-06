package com.tradeazy.repository;

import com.tradeazy.entity.Subscription;
import com.tradeazy.entity.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    /**
     * The seller's currently ACTIVE subscription (there can be at most one).
     */
    Optional<Subscription> findFirstBySellerIdAndStatusOrderByExpiryDateDesc(
            Long sellerId, SubscriptionStatus status);

    /**
     * All subscriptions for a seller, most recent first.
     */
    Page<Subscription> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    /**
     * Fast existence check: does the seller have any non-expired ACTIVE subscription?
     * Used by SubscriptionService.hasActiveRent() on every product create.
     */
    @Query("""
        SELECT COUNT(s) > 0 FROM Subscription s
        WHERE s.seller.id = :sellerId
          AND s.status = 'ACTIVE'
          AND s.expiryDate > :now
    """)
    boolean hasActiveRent(@Param("sellerId") Long sellerId, @Param("now") OffsetDateTime now);

    /**
     * Find all subscriptions that have expired but are still marked ACTIVE.
     * Used by a scheduled job (future) to auto-expire them.
     */
    @Query("""
        SELECT s FROM Subscription s
        WHERE s.status = 'ACTIVE'
          AND s.expiryDate <= :now
    """)
    List<Subscription> findExpiredActiveSubscriptions(@Param("now") OffsetDateTime now);

    long countByStatus(SubscriptionStatus status);
}
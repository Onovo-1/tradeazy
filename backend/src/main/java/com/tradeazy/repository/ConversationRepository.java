package com.tradeazy.repository;

import com.tradeazy.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByBuyerIdAndSellerIdAndProductId(
            Long buyerId, Long sellerId, Long productId);

    /**
     * All conversations a user participates in (as buyer OR seller),
     * that actually contain at least 1 message OR 1 offer.
     * Filtered by role (BUYER / SELLER) if provided.
     */
    @Query("""
        SELECT DISTINCT c FROM Conversation c
        LEFT JOIN c.messages m
        LEFT JOIN c.offers o
        WHERE (c.buyer.id = :userId OR c.seller.id = :userId)
          AND (m.id IS NOT NULL OR o.id IS NOT NULL)
          AND (:roleFilter IS NULL OR :roleFilter = '' 
               OR (:roleFilter = 'BUYER' AND c.buyer.id = :userId)
               OR (:roleFilter = 'SELLER' AND c.seller.id = :userId))
        ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC
    """)
    Page<Conversation> findAllForUser(
            @Param("userId") Long userId, 
            @Param("roleFilter") String roleFilter, 
            Pageable pageable);

    /**
     * Conversations with unread messages OR pending offers waiting for the user.
     * Filtered by role (BUYER / SELLER) if provided.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE (c.buyer.id = :userId OR c.seller.id = :userId)
          AND (
            EXISTS (
                SELECT 1 FROM Message m
                WHERE m.conversation.id = c.id
                  AND m.sender.id <> :userId
                  AND m.read = false
            )
            OR EXISTS (
                SELECT 1 FROM Offer o
                WHERE o.conversation.id = c.id
                  AND o.status = 'PENDING'
                  AND o.buyer.id <> :userId
            )
          )
          AND (:roleFilter IS NULL OR :roleFilter = '' 
               OR (:roleFilter = 'BUYER' AND c.buyer.id = :userId)
               OR (:roleFilter = 'SELLER' AND c.seller.id = :userId))
        ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC
    """)
    Page<Conversation> findUnreadForUser(
            @Param("userId") Long userId, 
            @Param("roleFilter") String roleFilter, 
            Pageable pageable);

    /**
     * Count conversations with unread messages OR pending offers.
     */
    @Query("""
        SELECT COUNT(DISTINCT c) FROM Conversation c
        WHERE (c.buyer.id = :userId OR c.seller.id = :userId)
          AND (
            EXISTS (
                SELECT 1 FROM Message m
                WHERE m.conversation.id = c.id
                  AND m.sender.id <> :userId
                  AND m.read = false
            )
            OR EXISTS (
                SELECT 1 FROM Offer o
                WHERE o.conversation.id = c.id
                  AND o.status = 'PENDING'
                  AND o.buyer.id <> :userId
            )
          )
    """)
    long countUnreadForUser(@Param("userId") Long userId);

    /**
     * Ownership/participation check.
     */
    @Query("""
        SELECT COUNT(c) > 0 FROM Conversation c
        WHERE c.id = :conversationId
          AND (c.buyer.id = :userId OR c.seller.id = :userId)
    """)
    boolean isParticipant(@Param("conversationId") Long conversationId,
                          @Param("userId") Long userId);
}
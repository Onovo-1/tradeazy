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

    /**
     * Lookup the unique conversation for a (buyer, seller, product) tuple.
     */
    Optional<Conversation> findByBuyerIdAndSellerIdAndProductId(
            Long buyerId, Long sellerId, Long productId);

    /**
     * All conversations a user participates in (as buyer OR seller),
     * ordered by most recent activity.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.buyer.id = :userId OR c.seller.id = :userId
        ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC
    """)
    Page<Conversation> findAllForUser(@Param("userId") Long userId, Pageable pageable);

    /**
     * Same as above but filtered to those with unread messages for this user.
     * A conversation is unread if it contains at least one message
     * not sent by `userId` and marked read = false.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE (c.buyer.id = :userId OR c.seller.id = :userId)
          AND EXISTS (
              SELECT 1 FROM Message m
              WHERE m.conversation.id = c.id
                AND m.sender.id <> :userId
                AND m.read = false
          )
        ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC
    """)
    Page<Conversation> findUnreadForUser(@Param("userId") Long userId, Pageable pageable);

    /**
     * Count conversations with unread messages — used by the navbar badge.
     */
    @Query("""
        SELECT COUNT(c) FROM Conversation c
        WHERE (c.buyer.id = :userId OR c.seller.id = :userId)
          AND EXISTS (
              SELECT 1 FROM Message m
              WHERE m.conversation.id = c.id
                AND m.sender.id <> :userId
                AND m.read = false
          )
    """)
    long countUnreadForUser(@Param("userId") Long userId);

    /**
     * Ownership/participation check — the user must be the buyer or the seller.
     */
    @Query("""
        SELECT COUNT(c) > 0 FROM Conversation c
        WHERE c.id = :conversationId
          AND (c.buyer.id = :userId OR c.seller.id = :userId)
    """)
    boolean isParticipant(@Param("conversationId") Long conversationId,
                          @Param("userId") Long userId);
}
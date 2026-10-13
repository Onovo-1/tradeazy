package com.tradeazy.repository;

import com.tradeazy.entity.Offer;
import com.tradeazy.entity.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    /**
     * All offers in a conversation, most recent first.
     */
    List<Offer> findByConversationIdOrderByCreatedAtDesc(Long conversationId);

    /**
     * Latest pending offer in a conversation (there should be at most one at a time).
     */
    Offer findFirstByConversationIdAndStatusOrderByCreatedAtDesc(
            Long conversationId, OfferStatus status);

    long countByStatus(OfferStatus status);
}
package com.tradeazy.repository;

import com.tradeazy.entity.Offer;
import com.tradeazy.entity.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByConversationIdOrderByCreatedAtDesc(Long conversationId);

    Optional<Offer> findFirstByConversationIdAndStatusOrderByCreatedAtDesc(
            Long conversationId, OfferStatus status);

    long countByStatus(OfferStatus status);
}
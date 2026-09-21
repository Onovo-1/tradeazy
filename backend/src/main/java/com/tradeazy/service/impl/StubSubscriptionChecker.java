package com.tradeazy.service.impl;

import com.tradeazy.service.SubscriptionChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Placeholder implementation for Phase 2 — always returns true.
 * Replaced by a real implementation in Phase 5.
 */
@Service
@Slf4j
public class StubSubscriptionChecker implements SubscriptionChecker {

    @Override
    public boolean hasActiveRent(Long sellerId) {
        // TODO Phase 5: query SubscriptionRepository for an ACTIVE, non-expired subscription
        log.debug("StubSubscriptionChecker: allowing seller {} (Phase 5 will enforce real Rent)", sellerId);
        return true;
    }
}
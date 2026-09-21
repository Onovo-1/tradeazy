package com.tradeazy.service;

/**
 * Interface for checking a seller's Rent subscription status.
 *
 * IMPORTANT: This is a placeholder for Phase 5 (Rent/Subscriptions).
 * Right now, ProductService will always be allowed to create products because
 * the stub implementation returns `true`.
 *
 * In Phase 5 we'll implement SubscriptionServiceImpl that actually checks
 * the seller's subscription expiry and returns false if expired.
 *
 * ProductService doesn't care which implementation is live — this is the
 * Dependency Inversion Principle in action.
 */
public interface SubscriptionChecker {

    /**
     * Returns true if the given seller has an ACTIVE, non-expired Rent subscription.
     */
    boolean hasActiveRent(Long sellerId);
}
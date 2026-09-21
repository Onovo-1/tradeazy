package com.tradeazy.entity.enums;

/**
 * Lifecycle status of a product listing.
 *
 *   ACTIVE   — visible in the marketplace, purchasable
 *   SOLD     — purchased; no longer purchasable, still visible in the seller's history
 *   EXPIRED  — auto-hidden for reasons other than sale (e.g. seller subscription lapse policies)
 *              NOTE: per our business rules, Rent expiry does NOT auto-expire products —
 *              this status exists for future use cases only.
 *   REMOVED  — soft-deleted by the seller or an admin; hidden from all public views
 */
public enum ProductStatus {
    ACTIVE,
    SOLD,
    EXPIRED,
    REMOVED
}
package com.tradeazy.exception;

/**
 * Thrown when an authenticated user tries to do something they're not allowed to do.
 * Examples: buyer trying to create a product, seller editing another seller's listing,
 *           user accessing another user's order.
 * Maps to HTTP 403.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
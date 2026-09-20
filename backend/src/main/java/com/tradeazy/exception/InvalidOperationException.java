package com.tradeazy.exception;

/**
 * Thrown when a request is syntactically valid but violates a business rule.
 * Examples: listing a product with inactive Rent, purchasing an SOLD product,
 *           countering an already-accepted offer.
 * Maps to HTTP 422 Unprocessable Entity (or 400 Bad Request if you prefer).
 */
public class InvalidOperationException extends RuntimeException {
    public InvalidOperationException(String message) {
        super(message);
    }
}
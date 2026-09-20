package com.tradeazy.exception;

/**
 * Thrown when trying to create an entity that violates a uniqueness constraint.
 * Examples: registering with an email that's already in use,
 *           favoriting a product twice.
 * Maps to HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
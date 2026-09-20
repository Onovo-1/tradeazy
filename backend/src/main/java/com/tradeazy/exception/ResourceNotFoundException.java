package com.tradeazy.exception;

/**
 * Thrown when an entity is expected to exist but doesn't.
 * Examples: product not found, user not found, order not found.
 * Maps to HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(resourceName + " not found: " + identifier);
        this.resourceName = resourceName;
    }

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceName = null;
    }

    public String getResourceName() {
        return resourceName;
    }
}
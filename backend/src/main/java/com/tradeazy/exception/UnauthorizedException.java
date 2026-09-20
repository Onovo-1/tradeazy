package com.tradeazy.exception;

/**
 * Thrown when authentication fails or is missing.
 * Examples: wrong password, expired JWT, no JWT at all.
 * Maps to HTTP 401.
 *
 * NOTE: Spring Security handles some 401s at the filter level
 * (via RestAuthenticationEntryPoint). This exception is for
 * service-level failures, e.g. bad credentials during login.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
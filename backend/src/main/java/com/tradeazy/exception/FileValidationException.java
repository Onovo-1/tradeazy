package com.tradeazy.exception;

/**
 * Thrown when an uploaded file fails validation (wrong type, too large, etc).
 * Maps to HTTP 400 via GlobalExceptionHandler.
 */
public class FileValidationException extends RuntimeException {
    public FileValidationException(String message) {
        super(message);
    }
}
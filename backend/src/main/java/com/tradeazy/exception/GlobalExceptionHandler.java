package com.tradeazy.exception;

import com.tradeazy.dto.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Central place where every exception thrown by a controller (or service)
 * gets translated into a uniform JSON error response.
 *
 * @RestControllerAdvice — applies to all @RestController classes.
 * Each @ExceptionHandler method handles a specific exception type.
 *
 * The most specific handler wins. If no specific handler matches,
 * the generic Exception handler at the bottom catches it (returns 500).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ---------------------------------------------------------------
    // 404 — resource doesn't exist
    // ---------------------------------------------------------------
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request
    ) {
        return build(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage(), request, null);
    }

    // ---------------------------------------------------------------
    // 409 — duplicate resource
    // ---------------------------------------------------------------
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicate(
            DuplicateResourceException ex, HttpServletRequest request
    ) {
        return build(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", ex.getMessage(), request, null);
    }

    // ---------------------------------------------------------------
    // 401 — unauthorized (bad login credentials at service level)
    // ---------------------------------------------------------------
    @ExceptionHandler({UnauthorizedException.class, BadCredentialsException.class})
    public ResponseEntity<ApiErrorResponse> handleUnauthorized(
            RuntimeException ex, HttpServletRequest request
    ) {
        String message = ex instanceof BadCredentialsException
                ? "Invalid credentials"
                : ex.getMessage();
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message, request, null);
    }

    // ---------------------------------------------------------------
    // 403 — forbidden (authenticated but not allowed)
    // ---------------------------------------------------------------
    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<ApiErrorResponse> handleForbidden(
            RuntimeException ex, HttpServletRequest request
    ) {
        String message = ex instanceof AccessDeniedException
                ? "You do not have permission to perform this action"
                : ex.getMessage();
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN", message, request, null);
    }

    // ---------------------------------------------------------------
    // 422 — business rule violated
    // ---------------------------------------------------------------
    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidOp(
            InvalidOperationException ex, HttpServletRequest request
    ) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_OPERATION", ex.getMessage(), request, null);
    }

    // ---------------------------------------------------------------
    // 400 — validation failure on @Valid @RequestBody
    // ---------------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            // If the same field has multiple errors, keep the first
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        // Also include any class-level errors (like our @AssertTrue password match)
        ex.getBindingResult().getGlobalErrors().forEach(ge ->
                fieldErrors.putIfAbsent(ge.getObjectName(), ge.getDefaultMessage())
        );

        return build(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_FAILED",
                "Validation failed for one or more fields",
                request,
                fieldErrors
        );
    }

    // ---------------------------------------------------------------
    // 400 — illegal arguments (fallback for programming errors)
    // ---------------------------------------------------------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request
    ) {
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), request, null);
    }

    // ---------------------------------------------------------------
    // 500 — anything else (last line of defence)
    // ---------------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAll(
            Exception ex, HttpServletRequest request
    ) {
        // Log the full stack trace server-side for debugging
        // Do NOT expose it to the client
        ex.printStackTrace();

        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Something went wrong. Please try again later.",
                request,
                null
        );
    }

    // ---------------------------------------------------------------
    // Helper — builds the standard error body
    // ---------------------------------------------------------------
    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status,
            String errorCode,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors
    ) {
        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(OffsetDateTime.now())
                .status(status.value())
                .error(errorCode)
                .message(message)
                .path(request.getRequestURI())
                .fieldErrors(fieldErrors)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
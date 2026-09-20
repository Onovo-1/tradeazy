package com.tradeazy.dto.response;

import lombok.*;

/**
 * Payload returned after successful login.
 *
 * The frontend stores the token (in memory or localStorage)
 * and attaches it to every subsequent request as:
 *   Authorization: Bearer <token>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    /** The JWT access token. */
    private String token;

    /** "Bearer" — tells the frontend what auth scheme to use. */
    @Builder.Default
    private String tokenType = "Bearer";

    /** Seconds until expiry (matches jwt.expiration-ms in application.yml). */
    private long expiresIn;

    /** Lightweight user info so the frontend can immediately render the navbar. */
    private UserResponse user;
}
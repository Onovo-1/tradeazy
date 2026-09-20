package com.tradeazy.security;

import com.tradeazy.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Static helpers for reading the currently authenticated user.
 *
 * IMPORTANT: These methods only work inside a request that has passed
 * through JwtAuthenticationFilter and therefore has a populated SecurityContext.
 * Calling them outside a request (e.g. from a scheduled job) returns null / throws.
 *
 * The current user is derived from the JWT — NEVER from a request body or path
 * parameter. This prevents IDOR attacks where a malicious client sends
 * someone else's user ID.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // utility class — prevent instantiation
    }

    /**
     * Returns the underlying User entity of the currently authenticated user,
     * or null if no one is authenticated (e.g. on a public endpoint).
     */
    public static User getCurrentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getUser();
        }
        return null;
    }

    /**
     * Returns the current User, throwing if none is authenticated.
     * Use this in authenticated endpoints where we KNOW a user must exist.
     */
    public static User getCurrentUser() {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new IllegalStateException("No authenticated user in the security context");
        }
        return user;
    }

    /**
     * Convenience: current user's ID, useful for ownership checks.
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
package com.tradeazy.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs once per HTTP request. Extracts the JWT from the Authorization header
 * and, if valid, marks the request as authenticated in Spring's SecurityContext.
 *
 * Spring then lets downstream filters and controllers see the authenticated user
 * (via SecurityUtils.getCurrentUser()).
 *
 * Design: silent-fail on invalid token. We do NOT write a 401 here. The request
 * simply proceeds unauthenticated, and Spring Security's authorization layer
 * will reject it (with our RestAuthenticationEntryPoint's JSON response) if the
 * endpoint requires auth.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader(AUTH_HEADER);

        // 1. No Authorization header or not Bearer → skip JWT logic
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract the raw token
        final String jwt = authHeader.substring(BEARER_PREFIX.length());

        try {
            // 3. Get username from token
            final String username = jwtService.extractUsername(jwt);

            // 4. Only proceed if not already authenticated in this request
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Validate token (signature + not expired + matches user)
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 6. Build authentication and set it in the SecurityContext
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,                    // credentials — null since we're past login
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            // Bad token format, expired, tampered signature, etc.
            // Just log and continue unauthenticated. Do NOT throw.
            logger.debug("JWT validation failed: " + ex.getMessage());
        }

        // 7. Continue down the filter chain
        filterChain.doFilter(request, response);
    }
}
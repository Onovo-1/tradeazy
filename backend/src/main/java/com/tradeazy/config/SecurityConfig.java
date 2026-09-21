package com.tradeazy.config;

import com.tradeazy.security.CustomUserDetailsService;
import com.tradeazy.security.JwtAuthenticationFilter;
import com.tradeazy.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * The real Spring Security configuration for Tradeazy.
 *
 * Key design decisions:
 *   - STATELESS sessions: we don't use HTTP sessions, JWT only.
 *   - CSRF disabled: we're a REST API with no browser cookies → CSRF N/A.
 *   - Custom JWT filter runs BEFORE UsernamePasswordAuthenticationFilter.
 *   - Public endpoints declared explicitly; everything else requires auth.
 *   - @EnableMethodSecurity → use @PreAuthorize("hasRole('ADMIN')") anywhere.
 *
 * Rule ordering matters: first match wins. Specific rules must come before
 * broader wildcards (e.g. /api/products/mine must precede /api/products/*).
 */
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;

    @Value("${tradeazy.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * URLs that don't require authentication for ANY method.
     * Method-specific public access (e.g. only GET /api/products) is handled
     * explicitly in the filter chain below so we don't accidentally open
     * write endpoints.
     */
    private static final String[] PUBLIC_URLS = {
            "/api/auth/register",
            "/api/auth/login",
            "/api/health",
            "/api/categories",
            "/api/categories/*",
            "/api/users/*/public",
            "/uploads/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/error"
    };

    // ---------------------------------------------------------------
    // 1. Password encoder — BCrypt with default strength (10 rounds)
    // ---------------------------------------------------------------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ---------------------------------------------------------------
    // 2. Authentication provider — ties UserDetailsService + encoder
    // ---------------------------------------------------------------
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ---------------------------------------------------------------
    // 3. AuthenticationManager — used by AuthService.login()
    // ---------------------------------------------------------------
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ---------------------------------------------------------------
    // 4. CORS source for Security
    // ---------------------------------------------------------------
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ---------------------------------------------------------------
    // 5. The filter chain — where it all comes together
    // ---------------------------------------------------------------
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — stateless REST API using JWT, no cookies
            .csrf(AbstractHttpConfigurer::disable)

            // Use our CORS bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless — don't create or use HTTP sessions
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // JSON 401 for unauthenticated requests to protected endpoints
            .exceptionHandling(eh -> eh.authenticationEntryPoint(authenticationEntryPoint))

            // URL-based authorization rules (FIRST MATCH WINS)
            .authorizeHttpRequests(auth -> auth
                // Allow CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // --- Seller dashboard routes FIRST (must beat the public wildcard below) ---
                .requestMatchers("/api/products/mine").hasRole("SELLER")
                .requestMatchers("/api/products/mine/**").hasRole("SELLER")

                // --- Public product reads (GET only) ---
                .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/category/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/*/images").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()

                // --- Other public URLs (auth, health, categories, swagger, uploads) ---
                .requestMatchers(PUBLIC_URLS).permitAll()

                // --- Admin area ---
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // --- Seller-only writes on products (POST/PUT/PATCH/DELETE) ---
                .requestMatchers(HttpMethod.POST,   "/api/products/**").hasRole("SELLER")
                .requestMatchers(HttpMethod.PUT,    "/api/products/**").hasRole("SELLER")
                .requestMatchers(HttpMethod.PATCH,  "/api/products/**").hasRole("SELLER")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("SELLER")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            // Plug in our authentication provider
            .authenticationProvider(authenticationProvider())

            // Insert our JWT filter BEFORE the standard username/password filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
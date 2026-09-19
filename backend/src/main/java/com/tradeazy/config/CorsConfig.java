package com.tradeazy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * CORS configuration.
 *
 * Without this, the browser at http://localhost:5173 (Vite dev server)
 * would be blocked from calling http://localhost:8080 (Spring Boot API).
 * The browser enforces this "same-origin" rule automatically.
 */
@Configuration
public class CorsConfig {

    @Value("${tradeazy.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow cookies / Authorization headers
        config.setAllowCredentials(true);

        // Read allowed origins from application.yml (comma-separated if multiple)
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));

        // Allow all headers (Authorization, Content-Type, etc.)
        config.setAllowedHeaders(List.of("*"));

        // Allow all relevant HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Let the frontend read the Authorization header from responses
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
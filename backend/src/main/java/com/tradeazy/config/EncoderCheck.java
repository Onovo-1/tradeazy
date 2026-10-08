package com.tradeazy.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * TEMPORARY diagnostic — verifies the PasswordEncoder bean behaves as BCrypt.
 * DELETE after confirming.
 */
@Component
@Order(999)
@RequiredArgsConstructor
public class EncoderCheck implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String storedHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        boolean matches = passwordEncoder.matches("password", storedHash);
        String freshHash = passwordEncoder.encode("password");

        System.out.println("============ ENCODER CHECK ============");
        System.out.println("Encoder class: " + passwordEncoder.getClass().getName());
        System.out.println("matches(\"password\", storedHash) = " + matches);
        System.out.println("Fresh hash of \"password\": " + freshHash);
        System.out.println("Fresh hash matches \"password\": " + passwordEncoder.matches("password", freshHash));
        System.out.println("=======================================");
    }
}
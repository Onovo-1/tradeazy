package com.tradeazy.config;

import com.tradeazy.entity.Role;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.RoleName;
import com.tradeazy.entity.enums.UserStatus;
import com.tradeazy.repository.RoleRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Seeds essential reference data on startup:
 *   - Three roles: BUYER, SELLER, ADMIN
 *   - One admin user (credentials from application.yml)
 *
 * Runs on every startup but is IDEMPOTENT — existing rows are left alone.
 * This means: safe to run in development, safe to run in production.
 *
 * CommandLineRunner executes AFTER the Spring context is fully initialized
 * but BEFORE the app accepts requests.
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${tradeazy.seed.admin.username}")
    private String adminUsername;

    @Value("${tradeazy.seed.admin.email}")
    private String adminEmail;

    @Value("${tradeazy.seed.admin.phone}")
    private String adminPhone;

    @Value("${tradeazy.seed.admin.password}")
    private String adminPassword;

    @Value("${tradeazy.seed.admin.first-name}")
    private String adminFirstName;

    @Value("${tradeazy.seed.admin.last-name}")
    private String adminLastName;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedAdmin();
    }

    // ============================================================
    // ROLES
    // ============================================================
    private void seedRoles() {
        for (RoleName name : RoleName.values()) {
            if (!roleRepository.existsByName(name)) {
                roleRepository.save(Role.builder().name(name).build());
                log.info("Seeded role: {}", name);
            }
        }
    }

    // ============================================================
    // ADMIN USER
    // ============================================================
    private void seedAdmin() {
        if (userRepository.existsByEmail(adminEmail)) {
            log.debug("Admin user already exists — skipping seed");
            return;
        }

        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new IllegalStateException(
                        "ADMIN role missing after seedRoles() — this should never happen"
                ));

        User admin = User.builder()
                .firstName(adminFirstName)
                .lastName(adminLastName)
                .username(adminUsername)
                .email(adminEmail)
                .phone(adminPhone)
                .password(passwordEncoder.encode(adminPassword))
                .status(UserStatus.ACTIVE)
                .build();

        admin.addRole(adminRole);
        userRepository.save(admin);

        log.warn("=======================================================");
        log.warn("  ADMIN USER SEEDED");
        log.warn("  Username: {}", adminUsername);
        log.warn("  Email:    {}", adminEmail);
        log.warn("  Password: {}", adminPassword);
        log.warn("  >>> Change this in production! <<<");
        log.warn("=======================================================");
    }
}
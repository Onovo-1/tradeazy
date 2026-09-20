package com.tradeazy.service;

import com.tradeazy.dto.request.LoginRequest;
import com.tradeazy.dto.request.RegisterRequest;
import com.tradeazy.dto.response.AuthResponse;
import com.tradeazy.dto.response.UserResponse;
import com.tradeazy.entity.Role;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.RoleName;
import com.tradeazy.entity.enums.UserStatus;
import com.tradeazy.exception.DuplicateResourceException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.exception.UnauthorizedException;
import com.tradeazy.mapper.UserMapper;
import com.tradeazy.repository.RoleRepository;
import com.tradeazy.repository.UserRepository;
import com.tradeazy.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles account registration and login.
 *
 * Design: returns DTOs, never entities. Business rules are enforced here,
 * NOT in the controller. The controller just translates HTTP ↔ service calls.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    // ================================================================
    // REGISTER
    // ================================================================
    /**
     * Creates a new BUYER or SELLER account.
     *
     * Steps:
     *   1. Reject ADMIN registration.
     *   2. Check email, username, phone uniqueness.
     *   3. Hash the password.
     *   4. Assign the chosen role.
     *   5. Save.
     *   6. Return safe user response.
     *
     * Transactional so the entire flow is atomic — either all saves succeed or none do.
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {

        // 1. Nobody can self-register as ADMIN
        if (request.getAccountType() == RoleName.ADMIN) {
            throw new InvalidOperationException("You cannot register as an administrator");
        }
        if (request.getAccountType() != RoleName.BUYER
                && request.getAccountType() != RoleName.SELLER) {
            throw new InvalidOperationException("Invalid account type. Must be BUYER or SELLER");
        }

        // 2. Uniqueness checks — fail fast, before hashing/DB work
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number is already registered");
        }

        // 3. Fetch the role row. It MUST exist because DataSeeder creates them at startup.
        Role role = roleRepository.findByName(request.getAccountType())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role not found: " + request.getAccountType()
                ));

        // 4. Hash the password — NEVER store plaintext
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // 5. Build the user
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(hashedPassword)
                .status(UserStatus.ACTIVE)
                .build();

        user.addRole(role);

        // 6. Persist + return safe DTO
        User saved = userRepository.save(user);
        return UserMapper.toResponse(saved);
    }

    // ================================================================
    // LOGIN
    // ================================================================
    /**
     * Authenticates credentials and returns a JWT.
     *
     * Steps:
     *   1. Delegate password check to Spring Security's AuthenticationManager.
     *      This uses CustomUserDetailsService + BCryptPasswordEncoder under the hood.
     *   2. If authentication fails → BadCredentialsException (caught by GlobalExceptionHandler → 401).
     *   3. Load the actual User entity for token generation (roles needed).
     *   4. Generate JWT.
     *   5. Return AuthResponse with token + safe user info.
     *
     * Note: `identifier` accepts EITHER email OR username.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {

        // 1. Let Spring Security verify credentials.
        //    This throws BadCredentialsException if wrong, DisabledException if suspended, etc.
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getIdentifier(),
                            request.getPassword()
                    )
            );
            // If we reach here, credentials are valid.
        } catch (BadCredentialsException ex) {
            // Re-throw as our own exception so GlobalExceptionHandler returns a clean 401
            throw new UnauthorizedException("Invalid email/username or password");
        }

        // 2. Load the entity — needed for JWT (roles) and AuthResponse (id, names, etc.)
        User user = userRepository.findByEmailOrUsername(request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + request.getIdentifier()
                ));

        // 3. Suspended users can't log in even if password is right.
        //    (Spring's isEnabled() also blocks this, but explicit check keeps the message clear.)
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account has been suspended. Contact support.");
        }

        // 4. Generate the JWT
        String token = jwtService.generateToken(user);

        // 5. Build response
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)   // convert ms → seconds
                .user(UserMapper.toResponse(user))
                .build();
    }
}
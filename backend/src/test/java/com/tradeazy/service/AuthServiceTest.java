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
import com.tradeazy.exception.UnauthorizedException;
import com.tradeazy.repository.RoleRepository;
import com.tradeazy.repository.UserRepository;
import com.tradeazy.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 *
 * Uses Mockito to isolate AuthService from real repositories, encoders,
 * and JWT machinery. We test BUSINESS LOGIC here, not wiring.
 *
 * Every test follows the same shape:
 *   ARRANGE — set up mocks
 *   ACT     — call the method
 *   ASSERT  — verify the outcome
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        // Inject the @Value-annotated jwtExpirationMs field (normally populated by Spring)
        ReflectionTestUtils.setField(authService, "jwtExpirationMs", 86_400_000L);
    }

    // ================================================================
    // REGISTER
    // ================================================================

    @Test
    @DisplayName("register: happy path — creates a buyer with hashed password and BUYER role")
    void register_createsBuyer() {
        // ARRANGE
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Test").lastName("Buyer")
                .username("testbuyer")
                .email("testbuyer@tradeazy.test")
                .phone("+2348012345678")
                .password("SecurePass123").confirmPassword("SecurePass123")
                .accountType(RoleName.BUYER)
                .build();

        Role buyerRole = Role.builder().id(1L).name(RoleName.BUYER).build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(roleRepository.findByName(RoleName.BUYER)).thenReturn(Optional.of(buyerRole));
        when(passwordEncoder.encode("SecurePass123")).thenReturn("$2a$10$hashed");

        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            u.setCreatedAt(OffsetDateTime.now());
            return u;
        });

        // ACT
        UserResponse response = authService.register(request);

        // ASSERT
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getEmail()).isEqualTo("testbuyer@tradeazy.test");
        assertThat(response.getRoles()).containsExactly(RoleName.BUYER);
        assertThat(response.getStatus()).isEqualTo(UserStatus.ACTIVE);

        // Verify the password was hashed before saving
        verify(passwordEncoder).encode("SecurePass123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register: duplicate email throws DuplicateResourceException")
    void register_duplicateEmail_throws() {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Test").lastName("Buyer")
                .username("testbuyer")
                .email("existing@tradeazy.test")
                .phone("+2348012345678")
                .password("SecurePass123").confirmPassword("SecurePass123")
                .accountType(RoleName.BUYER)
                .build();

        when(userRepository.existsByEmail("existing@tradeazy.test")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email is already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("register: ADMIN self-registration is rejected")
    void register_adminRole_throws() {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Evil").lastName("Hacker")
                .username("evil")
                .email("evil@tradeazy.test")
                .phone("+2348099999999")
                .password("SecurePass123").confirmPassword("SecurePass123")
                .accountType(RoleName.ADMIN)
                .build();

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("cannot register as an administrator");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("register: duplicate username throws DuplicateResourceException")
    void register_duplicateUsername_throws() {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Test").lastName("Buyer")
                .username("taken")
                .email("new@tradeazy.test")
                .phone("+2348011111111")
                .password("SecurePass123").confirmPassword("SecurePass123")
                .accountType(RoleName.BUYER)
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username is already taken");
    }

    // ================================================================
    // LOGIN
    // ================================================================

    @Test
    @DisplayName("login: happy path — returns AuthResponse with token")
    void login_returnsToken() {
        // ARRANGE
        LoginRequest request = LoginRequest.builder()
                .identifier("testbuyer")
                .password("SecurePass123")
                .build();

        Role buyerRole = Role.builder().id(1L).name(RoleName.BUYER).build();
        User user = User.builder()
                .id(10L)
                .firstName("Test").lastName("Buyer")
                .username("testbuyer")
                .email("testbuyer@tradeazy.test")
                .phone("+2348012345678")
                .password("$2a$10$hashed")
                .status(UserStatus.ACTIVE)
                .build();
        user.addRole(buyerRole);
        user.setCreatedAt(OffsetDateTime.now());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("testbuyer", null));
        when(userRepository.findByEmailOrUsername("testbuyer")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("mock.jwt.token");

        // ACT
        AuthResponse response = authService.login(request);

        // ASSERT
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(86_400L); // 86400000 ms / 1000
        assertThat(response.getUser().getUsername()).isEqualTo("testbuyer");
    }

    @Test
    @DisplayName("login: bad credentials throws UnauthorizedException")
    void login_badCredentials_throws() {
        LoginRequest request = LoginRequest.builder()
                .identifier("testbuyer")
                .password("WrongPassword")
                .build();

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad creds"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email/username or password");

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("login: suspended user throws UnauthorizedException")
    void login_suspendedUser_throws() {
        LoginRequest request = LoginRequest.builder()
                .identifier("suspended")
                .password("SecurePass123")
                .build();

        User suspended = User.builder()
                .id(99L)
                .firstName("Bad").lastName("Actor")
                .username("suspended")
                .email("suspended@tradeazy.test")
                .phone("+2348000000000")
                .password("$2a$10$hashed")
                .status(UserStatus.SUSPENDED)
                .build();
        suspended.setRoles(Set.of());

        when(authenticationManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken("suspended", null)
        );
        when(userRepository.findByEmailOrUsername("suspended")).thenReturn(Optional.of(suspended));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("suspended");
    }
}
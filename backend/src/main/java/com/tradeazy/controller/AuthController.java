package com.tradeazy.controller;

import com.tradeazy.dto.request.LoginRequest;
import com.tradeazy.dto.request.RegisterRequest;
import com.tradeazy.dto.response.AuthResponse;
import com.tradeazy.dto.response.UserResponse;
import com.tradeazy.entity.User;
import com.tradeazy.mapper.UserMapper;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints.
 *
 * Thin controller: HTTP concerns only (paths, status codes, validation trigger).
 * Business logic lives in AuthService.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, and get current user")
public class AuthController {

    private final AuthService authService;

    // ------------------------------------------------------------
    // POST /api/auth/register
    // ------------------------------------------------------------
    @PostMapping("/register")
    @Operation(summary = "Register a new buyer or seller account")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse created = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ------------------------------------------------------------
    // POST /api/auth/login
    // ------------------------------------------------------------
    @PostMapping("/login")
    @Operation(summary = "Login with email or username; returns JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------
    // GET /api/auth/me
    // Requires valid JWT (Authorization: Bearer <token>)
    // ------------------------------------------------------------
    @GetMapping("/me")
    @Operation(summary = "Return the currently authenticated user")
    public ResponseEntity<UserResponse> me() {
        // SecurityUtils reads the current user from the JWT-populated SecurityContext.
        // Never trusts any ID from the request — the JWT is the source of truth.
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(UserMapper.toResponse(currentUser));
    }
}
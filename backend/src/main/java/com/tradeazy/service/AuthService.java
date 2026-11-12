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

import java.util.UUID;

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
    @Transactional
    public UserResponse register(RegisterRequest request) {

        if (request.getAccountType() == RoleName.ADMIN) {
            throw new InvalidOperationException("You cannot register as an administrator");
        }
        if (request.getAccountType() != RoleName.BUYER
                && request.getAccountType() != RoleName.SELLER) {
            throw new InvalidOperationException("Invalid account type. Must be BUYER or SELLER");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number is already registered");
        }

        Role role = roleRepository.findByName(request.getAccountType())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role not found: " + request.getAccountType()
                ));

        String hashedPassword = passwordEncoder.encode(request.getPassword());

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

        User saved = userRepository.save(user);
        return UserMapper.toResponse(saved);
    }

    // ================================================================
    // LOGIN
    // ================================================================
    @Transactional
    public AuthResponse login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getIdentifier(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid email/username or password");
        }

        User user = userRepository.findByEmailOrUsername(request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + request.getIdentifier()
                ));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account has been suspended. Contact support.");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(UserMapper.toResponse(user))
                .build();
    }

    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserMapper.toResponse(user);
    }
}
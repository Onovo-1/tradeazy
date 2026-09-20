package com.tradeazy.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Payload for POST /api/auth/login.
 *
 * `identifier` may be an email OR a username — the service
 * tries both via UserRepository.findByEmailOrUsername().
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Email or username is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}
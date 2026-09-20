package com.tradeazy.dto.request;

import com.tradeazy.entity.enums.RoleName;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Payload for POST /api/auth/register.
 *
 * All constraints here are enforced by Bean Validation (Hibernate Validator).
 * The controller must annotate the parameter with @Valid, otherwise these
 * constraints are ignored.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 60, message = "First name must be at most 60 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 60, message = "Last name must be at most 60 characters")
    private String lastName;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(
        regexp = "^[a-zA-Z0-9._]+$",
        message = "Username can only contain letters, numbers, dots, and underscores"
    )
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 120, message = "Email must be at most 120 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^\\+?[0-9]{7,15}$",
        message = "Phone number must be 7-15 digits, optionally starting with +"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
        message = "Password must contain at least one letter and one number"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    /**
     * BUYER or SELLER only. ADMIN cannot self-register (seeded by us).
     */
    @NotNull(message = "Account type is required")
    private RoleName accountType;

    @AssertTrue(message = "Passwords do not match")
    public boolean isPasswordConfirmed() {
        return password != null && password.equals(confirmPassword);
    }
}
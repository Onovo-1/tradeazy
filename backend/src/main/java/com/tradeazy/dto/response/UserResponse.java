package com.tradeazy.dto.response;

import com.tradeazy.entity.enums.RoleName;
import com.tradeazy.entity.enums.UserStatus;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Set;

/**
 * Safe outward-facing representation of a User.
 *
 * Notice: NO password field. Roles are flattened to a Set<RoleName>
 * so we never expose the Role entity (which itself contains a roles field —
 * exposing it could cause circular serialization).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phone;
    private String profilePictureUrl;
    private String location;
    private UserStatus status;
    private Set<RoleName> roles;
    private OffsetDateTime createdAt;
}
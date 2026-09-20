package com.tradeazy.mapper;

import com.tradeazy.dto.response.UserResponse;
import com.tradeazy.entity.Role;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.RoleName;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Converts between User entities and UserResponse DTOs.
 *
 * Design: static utility class. No state, no dependencies, no Spring bean.
 * Called from services like: UserMapper.toResponse(user)
 */
public final class UserMapper {

    private UserMapper() {
        // Utility class — prevent instantiation
    }

    /**
     * Convert a User entity into a safe UserResponse DTO.
     *
     * IMPORTANT: The caller must be inside a transaction OR have eagerly
     * fetched the roles. Otherwise, calling user.getRoles() on a lazy
     * collection outside a session throws LazyInitializationException.
     * Our services will always call this inside @Transactional methods.
     */
    public static UserResponse toResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profilePictureUrl(user.getProfilePictureUrl())
                .location(user.getLocation())
                .status(user.getStatus())
                .roles(mapRoles(user.getRoles()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Map Set<Role> → Set<RoleName>.
     * We expose only the enum, not the whole Role entity —
     * that keeps the API contract clean and prevents circular
     * references if Role ever grows a back-reference to User.
     */
    private static Set<RoleName> mapRoles(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) return Set.of();
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}
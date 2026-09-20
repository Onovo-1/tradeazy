package com.tradeazy.entity;

import com.tradeazy.entity.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import com.tradeazy.entity.enums.RoleName;

/**
 * A Tradeazy user.
 *
 * Every buyer, seller, and admin is a User. The distinguishing factor is which
 * Role(s) they hold — enforced at the security layer, not the DB layer.
 *
 * Note: This entity is NOT returned directly from controllers. We map it to
 * UserResponse DTOs to avoid leaking password hashes and to keep the API contract stable.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email",    columnNames = "email"),
        @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
        @UniqueConstraint(name = "uk_users_phone",    columnNames = "phone")
    },
    indexes = {
        @Index(name = "idx_users_status", columnList = "status"),
        @Index(name = "idx_users_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 60)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 60)
    private String lastName;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    /**
     * BCrypt hash of the password. NEVER the plaintext.
     * 60 characters is the standard BCrypt output length.
     */
    @Column(nullable = false, length = 72)
    private String password;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(length = 120)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"),
        uniqueConstraints = @UniqueConstraint(
            name = "uk_user_roles_user_role",
            columnNames = {"user_id", "role_id"}
        )
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ---- Lifecycle hooks ----

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = UserStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // ---- Helper: add role without duplicates ----

    public void addRole(Role role) {
        this.roles.add(role);
    }

    public boolean hasRole(RoleName roleName) {
        return this.roles.stream().anyMatch(r -> r.getName() == roleName);
    }

    // ---- equals / hashCode based on id (JPA-safe) ----

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
package com.tradeazy.entity;

import com.tradeazy.entity.enums.RoleName;
import jakarta.persistence.*;
import lombok.*;

/**
 * A role that can be assigned to a user.
 *
 * We store the role as an enum in the DB. Rows are seeded once on startup:
 *   1 → ROLE_BUYER
 *   2 → ROLE_SELLER
 *   3 → ROLE_ADMIN
 *
 * The uniqueness constraint on `name` prevents accidental duplicates.
 */
@Entity
@Table(
    name = "roles",
    uniqueConstraints = @UniqueConstraint(name = "uk_roles_name", columnNames = "name")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RoleName name;

    // ---- equals / hashCode based on id (JPA-safe) ----

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Role other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
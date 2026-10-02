package com.tradeazy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * A buyer's saved product.
 *
 * Design:
 *   - A user can favorite many products.
 *   - A product can be favorited by many users.
 *   - The (user_id, product_id) pair is UNIQUE — prevents duplicates at the DB level.
 *
 * The Product.favoriteCount field is updated by FavoriteService when favorites are added/removed.
 */
@Entity
@Table(
    name = "favorites",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_favorites_user_product",
        columnNames = {"user_id", "product_id"}
    ),
    indexes = {
        @Index(name = "idx_favorites_user", columnList = "user_id"),
        @Index(name = "idx_favorites_product", columnList = "product_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Favorite other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
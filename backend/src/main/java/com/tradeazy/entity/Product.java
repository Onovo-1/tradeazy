package com.tradeazy.entity;

import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A product listing created by a SELLER.
 *
 * Design notes:
 *   - price is BigDecimal, NOT double — currency needs exact precision
 *   - discountPercent is optional; 0 means no discount
 *   - specifications is a free-form TEXT field (JSON-as-String for simplicity)
 *   - images are stored in a separate table with a @OneToMany relationship
 *   - viewCount and favoriteCount are denormalized counters kept in sync by services
 *     (denormalized = faster reads; we accept small risk of drift)
 */
@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_products_seller", columnList = "seller_id"),
        @Index(name = "idx_products_category", columnList = "category_id"),
        @Index(name = "idx_products_status", columnList = "status"),
        @Index(name = "idx_products_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCondition condition;

    @Column(nullable = false, length = 120)
    private String location;

    @Column(name = "discount_percent")
    @Builder.Default
    private Integer discountPercent = 0;

    @Column(columnDefinition = "TEXT")
    private String specifications;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "favorite_count", nullable = false)
    @Builder.Default
    private Long favoriteCount = 0L;

    // ----- Relationships -----

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(
        mappedBy = "product",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    // ----- Timestamps -----

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = ProductStatus.ACTIVE;
        if (this.viewCount == null) this.viewCount = 0L;
        if (this.favoriteCount == null) this.favoriteCount = 0L;
        if (this.quantity == null) this.quantity = 1;
        if (this.discountPercent == null) this.discountPercent = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // ----- Helpers -----

    /**
     * Add an image to this product and set the back-reference.
     * Call this instead of product.getImages().add(img) — it keeps both sides in sync.
     */
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }

    /**
     * Effective price after discount. Rounded to 2 decimal places.
     */
    public BigDecimal getEffectivePrice() {
        if (discountPercent == null || discountPercent <= 0) return price;
        BigDecimal discount = price
                .multiply(BigDecimal.valueOf(discountPercent))
                .divide(BigDecimal.valueOf(100));
        return price.subtract(discount).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    // ----- equals / hashCode -----

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Product other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
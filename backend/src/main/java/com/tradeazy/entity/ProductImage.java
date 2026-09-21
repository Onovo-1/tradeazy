package com.tradeazy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * An uploaded image for a product.
 *
 * We store only the URL (relative path like "/uploads/products/abc-123.jpg")
 * — NOT the binary. In production this URL would point to Cloudinary/S3.
 * In dev it's served from the backend's ./uploads folder.
 *
 * displayOrder lets the frontend show images in a defined order.
 * The image with isPrimary = true is the "cover" shown in product cards.
 */
@Entity
@Table(
    name = "product_images",
    indexes = {
        @Index(name = "idx_product_images_product", columnList = "product_id"),
        @Index(name = "idx_product_images_primary", columnList = "product_id, is_primary")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // ----- Relationship (owning side) -----

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        if (this.displayOrder == null) this.displayOrder = 0;
        if (this.isPrimary == null) this.isPrimary = false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProductImage other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
package com.tradeazy.repository;

import com.tradeazy.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    /**
     * All images for a product, ordered for display.
     * Primary image comes first (ORDER BY is_primary DESC, display_order ASC).
     */
    @Query("""
        SELECT pi FROM ProductImage pi
        WHERE pi.product.id = :productId
        ORDER BY pi.isPrimary DESC, pi.displayOrder ASC
    """)
    List<ProductImage> findByProductIdOrdered(@Param("productId") Long productId);

    /**
     * Find a specific image only if it belongs to the given product.
     * Prevents tampering with another product's images.
     */
    Optional<ProductImage> findByIdAndProductId(Long id, Long productId);

    /**
     * Count images for a product — used to enforce max image limit.
     */
    long countByProductId(Long productId);

    /**
     * Find the current primary image (if any) so we can swap it when
     * a new primary is uploaded.
     */
    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId);

    /**
     * Bulk delete all images for a product (used when deleting a product).
     */
    @Modifying
    @Query("DELETE FROM ProductImage pi WHERE pi.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
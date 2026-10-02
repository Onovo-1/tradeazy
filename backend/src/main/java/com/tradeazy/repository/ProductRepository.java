package com.tradeazy.repository;

import com.tradeazy.entity.Product;
import com.tradeazy.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Product.
 *
 * Extends:
 *   - JpaRepository — CRUD + paging
 *   - JpaSpecificationExecutor — enables dynamic filtering (used by the search endpoint)
 *
 * The Specification-based approach lets us build search queries like:
 *   "all ACTIVE electronics under ₦500,000 in Lagos matching keyword 'iphone'"
 * at runtime without writing 20 different repository methods.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // ----- Basic lookups -----

    Optional<Product> findByIdAndStatus(Long id, ProductStatus status);

    // ----- Seller queries -----

    /**
     * All products by a seller (any status), paginated.
     * Used by the seller's "My Products" dashboard.
     */
    Page<Product> findAllBySellerId(Long sellerId, Pageable pageable);

    /**
     * Products by a seller filtered by status.
     * Used for "Active listings", "Sold items" tabs.
     */
    Page<Product> findAllBySellerIdAndStatus(Long sellerId, ProductStatus status, Pageable pageable);

    long countBySellerIdAndStatus(Long sellerId, ProductStatus status);

    long countBySellerId(Long sellerId);

    // ----- Public marketplace queries -----

    /**
     * Only ACTIVE products are visible to buyers on the marketplace.
     * This is our safety net — the search endpoint uses Specifications,
     * but this is a simple way to grab a filtered list.
     */
    Page<Product> findAllByStatus(ProductStatus status, Pageable pageable);

    /**
     * Products in a category that are ACTIVE.
     * Used for the "browse by category" pages.
     */
    Page<Product> findAllByCategoryIdAndStatus(Long categoryId, ProductStatus status, Pageable pageable);

    // ----- Counters (admin dashboard) -----

    long countByStatus(ProductStatus status);

    // ----- Denormalized counter updates -----
    // We update viewCount / favoriteCount with atomic queries to avoid race conditions.
    // If two requests increment simultaneously, a "read, +1, write" approach would
    // lose one increment. The DB-level UPDATE avoids that.

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Product p SET p.favoriteCount = p.favoriteCount + 1 WHERE p.id = :id")
    void incrementFavoriteCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Product p SET p.favoriteCount = CASE WHEN p.favoriteCount > 0 THEN p.favoriteCount - 1 ELSE 0 END WHERE p.id = :id")
    void decrementFavoriteCount(@Param("id") Long id);

    // ----- Bulk queries for Phase 3 (search) support -----

    /**
     * Check if a product exists and belongs to a specific seller.
     * Used for ownership checks in the service layer.
     */
    boolean existsByIdAndSellerId(Long id, Long sellerId);

    /**
     * Fetch a product ONLY if it's owned by the given seller.
     * Prevents unauthorized access at the query level.
     */
    Optional<Product> findByIdAndSellerId(Long id, Long sellerId);

    /**
     * Seller's other ACTIVE products (for "More from this seller" section).
     * Excludes a specific product (usually the current one).
     */
    @Query("""
        SELECT p FROM Product p
        WHERE p.seller.id = :sellerId
          AND p.status = 'ACTIVE'
          AND p.id <> :excludeId
        ORDER BY p.createdAt DESC
    """)
    List<Product> findOtherActiveBySeller(
            @Param("sellerId") Long sellerId,
            @Param("excludeId") Long excludeId,
            Pageable pageable
    );
}
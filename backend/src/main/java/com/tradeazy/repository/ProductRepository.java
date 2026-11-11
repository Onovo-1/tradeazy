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

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findAllBySellerId(Long sellerId, Pageable pageable);
    long countBySellerId(Long sellerId);
    Optional<Product> findByIdAndSellerId(Long id, Long sellerId);
    Page<Product> findAllByStatus(ProductStatus status, Pageable pageable);
    long countByStatus(ProductStatus status);

    // Get all products for a specific seller and status
    Page<Product> findAllBySellerIdAndStatus(Long sellerId, ProductStatus status, Pageable pageable);

    @Query("""
        SELECT p FROM Product p 
        WHERE p.status = :status 
        AND (p.category.id IN :categoryIds OR p.category.parent.id IN :categoryIds)
    """)
    Page<Product> findByCategoryIdsAndStatus(
            @Param("categoryIds") List<Long> categoryIds, 
            @Param("status") ProductStatus status, 
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Product p SET p.favoriteCount = p.favoriteCount + 1 WHERE p.id = :id")
    void incrementFavoriteCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Product p SET p.favoriteCount = p.favoriteCount - 1 WHERE p.id = :id AND p.favoriteCount > 0")
    void decrementFavoriteCount(@Param("id") Long id);

    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.status <> 'REMOVED'")
    Optional<Product> findActiveById(@Param("id") Long id);
}
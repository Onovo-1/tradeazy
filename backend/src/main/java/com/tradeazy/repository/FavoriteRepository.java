package com.tradeazy.repository;

import com.tradeazy.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    /**
     * Page of favorites for a user.
     * We DON'T join-fetch images here — that breaks Hibernate pagination.
     * Images will be lazy-loaded by the mapper inside the @Transactional service.
     */
    Page<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
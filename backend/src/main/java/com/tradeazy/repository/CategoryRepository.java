package com.tradeazy.repository;

import com.tradeazy.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);
    Optional<Category> findByName(String name);

    boolean existsByName(String name);
    boolean existsBySlug(String slug);

    // --- Active-only queries ---
    List<Category> findAllByActiveTrue();
    Page<Category> findAllByActiveTrue(Pageable pageable);

    // --- Hierarchy-aware queries ---
    /**
     * Top-level categories — those with no parent.
     */
    List<Category> findAllByParentIsNullAndActiveTrueOrderByNameAsc();

    /**
     * Direct children of a category.
     */
    List<Category> findAllByParentIdAndActiveTrueOrderByNameAsc(Long parentId);

    /**
     * All leaf categories (no children) — for a product-create dropdown if needed.
     */
    @Query("""
        SELECT c FROM Category c
        WHERE c.active = true
          AND NOT EXISTS (
              SELECT 1 FROM Category child WHERE child.parent.id = c.id
          )
        ORDER BY c.name
    """)
    List<Category> findAllLeaves();
}
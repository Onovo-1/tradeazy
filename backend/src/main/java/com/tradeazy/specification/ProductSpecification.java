package com.tradeazy.specification;

import com.tradeazy.entity.Product;
import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic WHERE clause builders for Product search.
 *
 * Each static method returns a Specification<Product> — a function that
 * Spring Data turns into SQL. They can be chained with .and(...).
 *
 * Every filter method is NULL-SAFE: if the filter value is null/blank,
 * the returned Specification is a no-op. This means the service can
 * pass all filters unconditionally and only the present ones take effect.
 */
public final class ProductSpecification {

    private ProductSpecification() {
        // utility class
    }

    // ============================================================
    // STATUS — always applied to public marketplace listings
    // ============================================================
    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.equal(root.get("status"), ProductStatus.ACTIVE);
    }

    // ============================================================
    // KEYWORD — matches name OR description, case-insensitive
    // ============================================================
    /**
     * Search "iphone" → matches products whose name or description contains "iphone".
     * Case-insensitive. If q is blank, returns a no-op.
     */
    public static Specification<Product> matchesKeyword(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction(); // no-op
            String pattern = "%" + q.trim().toLowerCase() + "%";
            Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
            Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
            return cb.or(nameMatch, descMatch);
        };
    }

    // ============================================================
    // CATEGORY — filter by category ID
    // ============================================================
    public static Specification<Product> inCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return cb.conjunction();
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    // ============================================================
    // CONDITION — NEW / USED / REFURBISHED
    // ============================================================
    public static Specification<Product> hasCondition(ProductCondition condition) {
        return (root, query, cb) -> {
            if (condition == null) return cb.conjunction();
            return cb.equal(root.get("condition"), condition);
        };
    }

    // ============================================================
    // PRICE RANGE — min and max, both optional
    // ============================================================
    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (min != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), min));
            }
            if (max != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), max));
            }
            if (predicates.isEmpty()) return cb.conjunction();
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // ============================================================
    // LOCATION — partial match, case-insensitive
    // ============================================================
    public static Specification<Product> locationMatches(String location) {
        return (root, query, cb) -> {
            if (location == null || location.isBlank()) return cb.conjunction();
            String pattern = "%" + location.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("location")), pattern);
        };
    }

    // ============================================================
    // SELLER — filter by seller ID (used by seller dashboard)
    // ============================================================
    public static Specification<Product> bySeller(Long sellerId) {
        return (root, query, cb) -> {
            if (sellerId == null) return cb.conjunction();
            return cb.equal(root.get("seller").get("id"), sellerId);
        };
    }

    // ============================================================
    // EXCLUDE a specific product (for "more from seller")
    // ============================================================
    public static Specification<Product> excludeId(Long productId) {
        return (root, query, cb) -> {
            if (productId == null) return cb.conjunction();
            return cb.notEqual(root.get("id"), productId);
        };
    }
}
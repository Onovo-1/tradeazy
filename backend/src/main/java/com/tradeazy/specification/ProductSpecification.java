package com.tradeazy.specification;

import com.tradeazy.entity.Product;
import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class ProductSpecification {

    private ProductSpecification() {}

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.equal(root.get("status"), ProductStatus.ACTIVE);
    }

    public static Specification<Product> matchesKeyword(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            String pattern = "%" + q.trim().toLowerCase() + "%";
            Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
            Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
            return cb.or(nameMatch, descMatch);
        };
    }

    public static Specification<Product> inCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return cb.conjunction();
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    /**
     * Match products whose category is any of the given IDs.
     * Used when a top-level or sub category is selected — we include
     * the whole subtree so "Electronics" also returns "Smartphones", "Gaming Laptops", etc.
     */
    public static Specification<Product> inCategories(List<Long> categoryIds) {
        return (root, query, cb) -> {
            if (categoryIds == null || categoryIds.isEmpty()) return cb.conjunction();
            return root.get("category").get("id").in(categoryIds);
        };
    }

    public static Specification<Product> hasCondition(ProductCondition condition) {
        return (root, query, cb) -> {
            if (condition == null) return cb.conjunction();
            return cb.equal(root.get("condition"), condition);
        };
    }

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (min != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), min));
            if (max != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), max));
            if (predicates.isEmpty()) return cb.conjunction();
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> locationMatches(String location) {
        return (root, query, cb) -> {
            if (location == null || location.isBlank()) return cb.conjunction();
            String pattern = "%" + location.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("location")), pattern);
        };
    }

    public static Specification<Product> bySeller(Long sellerId) {
        return (root, query, cb) -> {
            if (sellerId == null) return cb.conjunction();
            return cb.equal(root.get("seller").get("id"), sellerId);
        };
    }

    public static Specification<Product> excludeId(Long productId) {
        return (root, query, cb) -> {
            if (productId == null) return cb.conjunction();
            return cb.notEqual(root.get("id"), productId);
        };
    }
}
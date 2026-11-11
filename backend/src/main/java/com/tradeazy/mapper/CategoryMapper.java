package com.tradeazy.mapper;

import com.tradeazy.dto.response.CategoryResponse;
import com.tradeazy.entity.Category;

import java.util.List;

public final class CategoryMapper {

    private CategoryMapper() {}

    /** Flat mapping — includes direct children as a shallow list (no recursion). */
    public static CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .active(category.getActive())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .createdAt(category.getCreatedAt())
                .build();
    }

    /**
     * Recursive tree mapping — includes full nested children.
     * Only call this inside a @Transactional service method.
     */
    public static CategoryResponse toTree(Category category) {
        if (category == null) return null;
        List<CategoryResponse> childNodes = category.getChildren().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .map(CategoryMapper::toTree)
                .toList();

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .active(category.getActive())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(childNodes)
                .createdAt(category.getCreatedAt())
                .build();
    }
}
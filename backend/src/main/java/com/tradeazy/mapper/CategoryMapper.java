package com.tradeazy.mapper;

import com.tradeazy.dto.response.CategoryResponse;
import com.tradeazy.entity.Category;

/**
 * Category → CategoryResponse conversion.
 */
public final class CategoryMapper {

    private CategoryMapper() {
        // utility class
    }

    public static CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
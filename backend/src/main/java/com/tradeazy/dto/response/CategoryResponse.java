package com.tradeazy.dto.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Safe representation of a Category for API responses.
 * Includes `children` for nested subcategories (mega-menu).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private Long parentId;
    private String name;
    private String slug;
    private String description;
    private Boolean active;
    private OffsetDateTime createdAt;
    private List<CategoryResponse> children; // <--- Crucial for dropdowns
}
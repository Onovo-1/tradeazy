package com.tradeazy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Payload for admin create/update category.
 * `slug` is optional — if blank, the server generates one from `name`.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 80, message = "Category name must be at most 80 characters")
    private String name;

    @Size(max = 80, message = "Slug must be at most 80 characters")
    private String slug; // optional

    @Size(max = 255, message = "Description must be at most 255 characters")
    private String description;
}
package com.tradeazy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 80, message = "Category name must be at most 80 characters")
    private String name;

    @Size(max = 120, message = "Slug must be at most 120 characters")
    private String slug;

    @Size(max = 255, message = "Description must be at most 255 characters")
    private String description;

    /** Optional — set to nest under another category. */
    private Long parentId;
}
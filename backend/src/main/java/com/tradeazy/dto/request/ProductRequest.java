package com.tradeazy.dto.request;

import com.tradeazy.entity.enums.ProductCondition;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Payload for POST/PUT /api/products.
 *
 * Category is referenced by ID (not name) — the frontend fetches the
 * category list first and sends the selected category's ID.
 *
 * Images are NOT part of this DTO — they're uploaded separately via
 * POST /api/products/{id}/images (multipart/form-data).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(min = 3, max = 150, message = "Product name must be between 3 and 150 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Condition is required")
    private ProductCondition condition;

    @NotBlank(message = "Location is required")
    @Size(max = 120, message = "Location must be at most 120 characters")
    private String location;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 100000, message = "Quantity is too large")
    private Integer quantity;

    @Min(value = 0, message = "Discount must be between 0 and 100")
    @Max(value = 100, message = "Discount must be between 0 and 100")
    @Builder.Default
    private Integer discountPercent = 0;

    @Size(max = 5000, message = "Specifications must be at most 5000 characters")
    private String specifications;
}
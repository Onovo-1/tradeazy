package com.tradeazy.dto.response;

import lombok.*;

import java.time.OffsetDateTime;

/**
 * Safe representation of a Category for API responses.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private Boolean active;
    private OffsetDateTime createdAt;
}
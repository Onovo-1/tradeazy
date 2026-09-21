package com.tradeazy.dto.response;

import lombok.*;

/**
 * A single product image.
 * Nested inside ProductResponse.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageResponse {

    private Long id;
    private String url;          // e.g. "/uploads/products/abc.jpg"
    private Boolean isPrimary;
    private Integer displayOrder;
}
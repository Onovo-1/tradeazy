package com.tradeazy.dto.response;

import lombok.*;

import java.util.List;

/**
 * Generic paginated response wrapper.
 *
 * Every list endpoint returns this shape:
 *   { content: [...], page: 0, size: 20, totalElements: 347, totalPages: 18, last: false }
 *
 * The frontend's pagination logic reads these fields uniformly across
 * products, orders, users, etc.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
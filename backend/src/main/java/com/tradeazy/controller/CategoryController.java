package com.tradeazy.controller;

import com.tradeazy.dto.request.CategoryRequest;
import com.tradeazy.dto.response.CategoryResponse;
import com.tradeazy.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Browse categories; admin can manage")
public class CategoryController {

    private final CategoryService categoryService;

    // Cache the tree so it doesn't hit the DB 500 times per page load
    private List<CategoryResponse> cachedTree = null;

    @GetMapping
    @Operation(summary = "List all active categories (nested tree)")
    public ResponseEntity<List<CategoryResponse>> list() {
        if (cachedTree == null) {
            cachedTree = categoryService.listTree();
        }
        return ResponseEntity.ok(cachedTree);
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get a category by slug")
    public ResponseEntity<CategoryResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoryService.getBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new category (admin only)")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        cachedTree = null;
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a category (admin only)")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        cachedTree = null;
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category (admin only)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cachedTree = null;
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
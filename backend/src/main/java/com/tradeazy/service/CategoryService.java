package com.tradeazy.service;

import com.tradeazy.dto.request.CategoryRequest;
import com.tradeazy.dto.response.CategoryResponse;
import com.tradeazy.entity.Category;
import com.tradeazy.exception.DuplicateResourceException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.mapper.CategoryMapper;
import com.tradeazy.repository.CategoryRepository;
import com.tradeazy.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for categories.
 *
 * Public read operations (list, detail) are open.
 * Write operations (create, update, delete) are admin-only — enforced by
 * @PreAuthorize at the controller and by Spring Security's URL rules.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // ----- Public reads -----

    @Transactional(readOnly = true)
    public List<CategoryResponse> listActive() {
        return categoryRepository.findAllByActiveTrue()
                .stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        return CategoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        return CategoryMapper.toResponse(category);
    }

    // ----- Admin writes -----

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String slug = resolveSlug(request);

        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category name already exists: " + request.getName());
        }
        if (categoryRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Category slug already exists: " + slug);
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .active(true)
                .build();

        Category saved = categoryRepository.save(category);
        return CategoryMapper.toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        // Name change → check uniqueness against OTHER rows
        if (!category.getName().equals(request.getName())
                && categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category name already exists: " + request.getName());
        }

        String newSlug = resolveSlug(request);
        if (!category.getSlug().equals(newSlug)
                && categoryRepository.existsBySlug(newSlug)) {
            throw new DuplicateResourceException("Category slug already exists: " + newSlug);
        }

        category.setName(request.getName());
        category.setSlug(newSlug);
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return CategoryMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        // We could soft-delete (set active=false) but for admin actions,
        // we'll block deletion if products exist under it.
        // (Real check happens in ProductRepository in a future module.)
        // For now, simple delete.
        categoryRepository.delete(category);
    }

    // ----- Helpers -----

    private String resolveSlug(CategoryRequest request) {
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String cleaned = SlugUtil.slugify(request.getSlug());
            if (cleaned.isBlank()) {
                throw new InvalidOperationException("Provided slug is not valid");
            }
            return cleaned;
        }
        String generated = SlugUtil.slugify(request.getName());
        if (generated.isBlank()) {
            throw new InvalidOperationException("Could not generate slug from name");
        }
        return generated;
    }
}
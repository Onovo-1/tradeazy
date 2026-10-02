package com.tradeazy.service;

import com.tradeazy.dto.request.ProductRequest;
import com.tradeazy.dto.response.ProductResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.entity.Category;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.exception.ForbiddenException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.mapper.ProductMapper;
import com.tradeazy.repository.CategoryRepository;
import com.tradeazy.repository.ProductRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.specification.ProductSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

/**
 * Product business logic.
 *
 * Core business rules enforced here:
 *   1. Only SELLERs can create products (enforced at controller too).
 *   2. A seller must have an ACTIVE Rent subscription to CREATE new listings.
 *   3. Rent expiry does NOT delete existing products — they stay visible.
 *   4. Sellers can only edit/delete/mark-sold their OWN products.
 *   5. Buyers can only see ACTIVE products on the public marketplace.
 *   6. Marking SOLD is permanent (no un-sold) — admin must intervene to restore.
 *   7. DELETE is a soft-delete (status = REMOVED) so order history stays intact.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final SubscriptionChecker subscriptionChecker;

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    // ============================================================
    // CREATE — with the Rent check
    // ============================================================
    @Transactional
    public ProductResponse create(ProductRequest request, Long sellerId) {

        // 1. Seller must have an active Rent subscription.
        //    Note: this is the business rule from the project spec.
        //    Existing listings remain visible when Rent expires,
        //    but the seller cannot create NEW ones.
        if (!subscriptionChecker.hasActiveRent(sellerId)) {
            throw new InvalidOperationException(
                    "Your Rent subscription is not active. "
                    + "Renew your Rent to create new listings. "
                    + "Your existing listings remain visible."
            );
        }

        // 2. Load seller + category
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + sellerId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + request.getCategoryId()
                ));

        // 3. Build and save
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .condition(request.getCondition())
                .location(request.getLocation())
                .quantity(request.getQuantity())
                .discountPercent(request.getDiscountPercent() == null ? 0 : request.getDiscountPercent())
                .specifications(request.getSpecifications())
                .status(ProductStatus.ACTIVE)
                .seller(seller)
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created: id={}, sellerId={}, name={}", saved.getId(), sellerId, saved.getName());
        return ProductMapper.toResponse(saved);
    }

    // ============================================================
    // UPDATE — ownership enforced
    // ============================================================
    @Transactional
    public ProductResponse update(Long productId, ProductRequest request, Long sellerId) {

        // Ownership: only the seller who owns it can edit
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException(
                        "Product not found or you do not own it"
                ));

        if (product.getStatus() == ProductStatus.SOLD) {
            throw new InvalidOperationException("Cannot edit a product that has been sold");
        }
        if (product.getStatus() == ProductStatus.REMOVED) {
            throw new InvalidOperationException("Cannot edit a removed product");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + request.getCategoryId()
                ));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setCondition(request.getCondition());
        product.setLocation(request.getLocation());
        product.setQuantity(request.getQuantity());
        product.setDiscountPercent(request.getDiscountPercent() == null ? 0 : request.getDiscountPercent());
        product.setSpecifications(request.getSpecifications());

        Product saved = productRepository.save(product);
        log.info("Product updated: id={}, sellerId={}", saved.getId(), sellerId);
        return ProductMapper.toResponse(saved);
    }

    // ============================================================
    // MARK AS SOLD
    // ============================================================
    @Transactional
    public ProductResponse markAsSold(Long productId, Long sellerId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        if (product.getStatus() == ProductStatus.SOLD) {
            throw new InvalidOperationException("Product is already marked as sold");
        }
        if (product.getStatus() == ProductStatus.REMOVED) {
            throw new InvalidOperationException("Cannot mark a removed product as sold");
        }

        product.setStatus(ProductStatus.SOLD);
        Product saved = productRepository.save(product);
        log.info("Product marked SOLD: id={}, sellerId={}", productId, sellerId);
        return ProductMapper.toResponse(saved);
    }

    // ============================================================
    // SOFT DELETE
    // ============================================================
    @Transactional
    public void delete(Long productId, Long sellerId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        if (product.getStatus() == ProductStatus.REMOVED) {
            return; // idempotent
        }

        product.setStatus(ProductStatus.REMOVED);
        productRepository.save(product);
        log.info("Product soft-deleted: id={}, sellerId={}", productId, sellerId);
    }

    // ============================================================
    // PUBLIC READS
    // ============================================================

    /**
     * Public product detail. Only ACTIVE or SOLD products are visible —
     * REMOVED products return 404. SOLD products stay visible for history.
     * View count is incremented atomically.
     */
    @Transactional
    public ProductResponse getPublicDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStatus() == ProductStatus.REMOVED || product.getStatus() == ProductStatus.EXPIRED) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }

        // Atomic increment (doesn't touch the loaded entity)
        productRepository.incrementViewCount(productId);

        // Update in-memory counter so response matches DB
        product.setViewCount(product.getViewCount() + 1);

        return ProductMapper.toResponse(product);
    }

    /**
 * Global search + filters.
 * All filters optional — passing null skips that filter.
 */
@Transactional(readOnly = true)
public PagedResponse<ProductSummaryResponse> search(
        String q,
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String location,
        ProductCondition condition,
        int page,
        int size,
        String sortBy
) {
    Specification<Product> spec = Specification
            .where(ProductSpecification.isActive())
            .and(ProductSpecification.matchesKeyword(q))
            .and(ProductSpecification.inCategory(categoryId))
            .and(ProductSpecification.priceBetween(minPrice, maxPrice))
            .and(ProductSpecification.locationMatches(location))
            .and(ProductSpecification.hasCondition(condition));

    Pageable pageable = buildPageable(page, size, sortBy);
    Page<Product> results = productRepository.findAll(spec, pageable);
    return toPagedResponse(results);
}
    /**
     * Seller's own product detail — any status is visible to the owner.
     */
    @Transactional(readOnly = true)
    public ProductResponse getOwnedDetail(Long productId, Long sellerId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        return ProductMapper.toResponse(product);
    }

    /**
     * Public listing — ACTIVE products only, paginated.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> listActive(int page, int size, String sortBy) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Product> products = productRepository.findAllByStatus(ProductStatus.ACTIVE, pageable);
        return toPagedResponse(products);
    }

    /**
     * Products in a category — public.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> listByCategory(String slug, int page, int size, String sortBy) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Product> products = productRepository.findAllByCategoryIdAndStatus(
                category.getId(), ProductStatus.ACTIVE, pageable
        );
        return toPagedResponse(products);
    }

    // ============================================================
    // SELLER DASHBOARD
    // ============================================================

    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> listMyProducts(Long sellerId, int page, int size, String sortBy) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Product> products = productRepository.findAllBySellerId(sellerId, pageable);
        return toPagedResponse(products);
    }

    @Transactional(readOnly = true)
    public long countMyProducts(Long sellerId) {
        return productRepository.countBySellerId(sellerId);
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private Pageable buildPageable(int page, int size, String sortBy) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);

        Sort sort = switch (sortBy == null ? "newest" : sortBy.toLowerCase()) {
            case "price_asc"  -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "popular"    -> Sort.by(Sort.Direction.DESC, "viewCount");
            default           -> Sort.by(Sort.Direction.DESC, "createdAt"); // newest
        };

        return PageRequest.of(safePage, safeSize, sort);
    }

    private PagedResponse<ProductSummaryResponse> toPagedResponse(Page<Product> page) {
        List<ProductSummaryResponse> content = page.getContent()
                .stream()
                .map(ProductMapper::toSummary)
                .toList();

        return PagedResponse.<ProductSummaryResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
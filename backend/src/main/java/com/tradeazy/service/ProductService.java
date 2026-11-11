package com.tradeazy.service;

import com.tradeazy.dto.request.ProductRequest;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.ProductResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.entity.Category;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.ProductImage;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.ProductCondition;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.exception.ForbiddenException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.mapper.ProductMapper;
import com.tradeazy.repository.CategoryRepository;
import com.tradeazy.repository.ProductImageRepository;
import com.tradeazy.repository.ProductRepository;
import com.tradeazy.repository.UserRepository;
import com.tradeazy.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;
    private final FileStorageService fileStorageService;
    private final SubscriptionService subscriptionService;

    private static final int MAX_PAGE_SIZE = 100;

    // ================= CREATE =================
    @Transactional
    public ProductResponse create(ProductRequest request, Long sellerId) {
        if (!subscriptionService.hasActiveRent(sellerId)) {
            throw new InvalidOperationException(
                "Your Rent subscription is not active. Renew your Rent to create new listings."
            );
        }

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + sellerId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

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

    // ================= UPDATE =================
    @Transactional
    public ProductResponse update(Long productId, ProductRequest request, Long sellerId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        if (product.getStatus() == ProductStatus.SOLD) {
            throw new InvalidOperationException("Cannot edit a product that has been sold");
        }
        if (product.getStatus() == ProductStatus.REMOVED) {
            throw new InvalidOperationException("Cannot edit a removed product");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

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
        return ProductMapper.toResponse(saved);
    }

    // ================= MARK SOLD =================
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
        if (product.getQuantity() <= 0) {
            throw new InvalidOperationException("Product is already out of stock");
        }

        // Decrement quantity
        product.setQuantity(product.getQuantity() - 1);

        // If we've just sold the last one, mark as SOLD
        if (product.getQuantity() == 0) {
            product.setStatus(ProductStatus.SOLD);
            log.info("Product {} fully sold out (quantity = 0)", productId);
        } else {
            log.info("Product {} marked sold: 1 unit sold, {} remaining", productId, product.getQuantity());
        }

        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    // ================= DELETE =================
    @Transactional
    public void delete(Long productId, Long sellerId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        if (product.getStatus() == ProductStatus.REMOVED) return;

        product.setStatus(ProductStatus.REMOVED);
        productRepository.save(product);
    }

    // ================= PUBLIC READS =================
    @Transactional
    public ProductResponse getPublicDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStatus() == ProductStatus.REMOVED || product.getStatus() == ProductStatus.EXPIRED) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }

        productRepository.incrementViewCount(productId);
        product.setViewCount(product.getViewCount() + 1);
        return ProductMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getOwnedDetail(Long productId, Long sellerId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        return ProductMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> listActive(int page, int size, String sortBy) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Product> products = productRepository.findAllByStatus(ProductStatus.ACTIVE, pageable);
        return toPagedResponse(products);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> listByCategory(String slug, int page, int size, String sortBy) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        
        List<Long> categoryIds = new ArrayList<>();
        categoryIds.add(category.getId());
        if (category.getChildren() != null) {
            category.getChildren().forEach(child -> categoryIds.add(child.getId()));
        }

        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Product> products = productRepository.findByCategoryIdsAndStatus(
                categoryIds, ProductStatus.ACTIVE, pageable
        );
        return toPagedResponse(products);
    }

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

    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> search(
            String q, List<Long> categoryIds, BigDecimal minPrice, BigDecimal maxPrice,
            String location, ProductCondition condition, int page, int size, String sortBy
    ) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.isActive())
                .and(ProductSpecification.matchesKeyword(q))
                .and(ProductSpecification.inCategories(categoryIds))
                .and(ProductSpecification.priceBetween(minPrice, maxPrice))
                .and(ProductSpecification.locationMatches(location))
                .and(ProductSpecification.hasCondition(condition));

        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Product> results = productRepository.findAll(spec, pageable);
        return toPagedResponse(results);
    }

    // ================= IMAGES =================

    @Transactional(readOnly = true)
    public List<String> getProductImageUrls(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        return product.getImages().stream().map(ProductImage::getUrl).toList();
    }

    @Transactional
    public void addImageToProduct(Long productId, Long sellerId, MultipartFile file) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        String imageUrl = fileStorageService.store(file, "products");
        boolean isPrimary = product.getImages().isEmpty();

        ProductImage image = ProductImage.builder()
                .product(product)
                .url(imageUrl)
                .isPrimary(isPrimary)
                .displayOrder(product.getImages().size())
                .build();

        productImageRepository.save(image);
        product.getImages().add(image);
        productRepository.save(product);
    }

    @Transactional
    public void setPrimaryImage(Long productId, Long sellerId, Long imageId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        for (ProductImage img : product.getImages()) {
            img.setIsPrimary(img.getId().equals(imageId));
            productImageRepository.save(img);
        }
    }

    @Transactional
    public void deleteImage(Long productId, Long sellerId, Long imageId) {
        Product product = productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ForbiddenException("Product not found or you do not own it"));

        ProductImage imageToDelete = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        fileStorageService.delete(imageToDelete.getUrl());
        productImageRepository.delete(imageToDelete);
    }

    // ================= HELPERS =================
    private Pageable buildPageable(int page, int size, String sortBy) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);

        Sort sort = switch (sortBy == null ? "newest" : sortBy.toLowerCase()) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "popular" -> Sort.by(Sort.Direction.DESC, "viewCount");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
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
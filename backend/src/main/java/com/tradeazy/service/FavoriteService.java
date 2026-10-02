package com.tradeazy.service;

import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.entity.Favorite;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.exception.DuplicateResourceException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.mapper.ProductMapper;
import com.tradeazy.repository.FavoriteRepository;
import com.tradeazy.repository.ProductRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final int MAX_PAGE_SIZE = 100;

    @Transactional
    public void addFavorite(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStatus() == ProductStatus.REMOVED
                || product.getStatus() == ProductStatus.EXPIRED) {
            throw new InvalidOperationException("Cannot favorite a product that is not available");
        }

        if (product.getSeller().getId().equals(userId)) {
            throw new InvalidOperationException("You cannot favorite your own product");
        }

        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new DuplicateResourceException("Product is already in your favorites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();

        favoriteRepository.save(favorite);
        productRepository.incrementFavoriteCount(productId);
        log.info("Favorite added: userId={}, productId={}", userId, productId);
    }

    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        Favorite favorite = favoriteRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite not found"));

        favoriteRepository.delete(favorite);
        productRepository.decrementFavoriteCount(productId);
        log.info("Favorite removed: userId={}, productId={}", userId, productId);
    }

    @Transactional(readOnly = true)
    public boolean isFavorited(Long userId, Long productId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }

    @Transactional(readOnly = true)
    public long countByUser(Long userId) {
        return favoriteRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> listUserFavorites(Long userId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Favorite> favoritePage = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<ProductSummaryResponse> content = favoritePage.getContent()
                .stream()
                .map(f -> ProductMapper.toSummary(f.getProduct()))
                .toList();

        return PagedResponse.<ProductSummaryResponse>builder()
                .content(content)
                .page(favoritePage.getNumber())
                .size(favoritePage.getSize())
                .totalElements(favoritePage.getTotalElements())
                .totalPages(favoritePage.getTotalPages())
                .last(favoritePage.isLast())
                .build();
    }
}
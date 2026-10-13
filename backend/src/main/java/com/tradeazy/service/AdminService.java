package com.tradeazy.service;

import com.tradeazy.dto.response.AdminDashboardResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.dto.response.UserResponse;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.OrderStatus;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.entity.enums.RoleName;
import com.tradeazy.entity.enums.SubscriptionStatus;
import com.tradeazy.entity.enums.UserStatus;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.mapper.ProductMapper;
import com.tradeazy.mapper.UserMapper;
import com.tradeazy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ConversationRepository conversationRepository;
    private final OfferRepository offerRepository;
    private final FavoriteRepository favoriteRepository;

    private static final int MAX_PAGE_SIZE = 100;

    // ============================================================
    // DASHBOARD
    // ============================================================
    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        long totalUsers = userRepository.count();
        long totalBuyers = userRepository.findAllByRole(RoleName.BUYER, PageRequest.of(0, 1)).getTotalElements();
        long totalSellers = userRepository.findAllByRole(RoleName.SELLER, PageRequest.of(0, 1)).getTotalElements();
        long totalAdmins = userRepository.findAllByRole(RoleName.ADMIN, PageRequest.of(0, 1)).getTotalElements();

        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByStatus(ProductStatus.ACTIVE);
        long soldProducts = productRepository.countByStatus(ProductStatus.SOLD);
        long removedProducts = productRepository.countByStatus(ProductStatus.REMOVED);

        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long completedOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);
        BigDecimal totalRevenue = orderRepository.sumTotalPaid();

        long activeSubscriptions = subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE);
        long expiredSubscriptions = subscriptionRepository.countByStatus(SubscriptionStatus.EXPIRED);
        BigDecimal subscriptionRevenue = subscriptionRepository.sumPaidAmount();

        long totalConversations = conversationRepository.count();
        long totalOffers = offerRepository.count();
        long totalFavorites = favoriteRepository.count();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalBuyers(totalBuyers)
                .totalSellers(totalSellers)
                .totalAdmins(totalAdmins)
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .soldProducts(soldProducts)
                .removedProducts(removedProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .activeSubscriptions(activeSubscriptions)
                .expiredSubscriptions(expiredSubscriptions)
                .subscriptionRevenue(subscriptionRevenue != null ? subscriptionRevenue : BigDecimal.ZERO)
                .totalConversations(totalConversations)
                .totalOffers(totalOffers)
                .totalFavorites(totalFavorites)
                .build();
    }

    // ============================================================
    // USERS
    // ============================================================
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> listUsers(String search, UserStatus status, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("createdAt").descending());

        Page<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.search(search, pageable);
        } else if (status != null) {
            users = userRepository.findAllByStatus(status, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        List<UserResponse> content = users.getContent().stream()
                .map(UserMapper::toResponse)
                .toList();

        return PagedResponse.<UserResponse>builder()
                .content(content)
                .page(users.getNumber())
                .size(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .last(users.isLast())
                .build();
    }

    @Transactional
    public UserResponse setUserStatus(Long userId, UserStatus newStatus, Long currentAdminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getId().equals(currentAdminId)) {
            throw new InvalidOperationException("You cannot change your own account status");
        }

        if (user.hasRole(RoleName.ADMIN)) {
            throw new InvalidOperationException("Cannot change another admin's status");
        }

        user.setStatus(newStatus);
        User saved = userRepository.save(user);
        log.info("Admin {} set user {} to {}", currentAdminId, userId, newStatus);
        return UserMapper.toResponse(saved);
    }

    // ============================================================
    // PRODUCTS
    // ============================================================
    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> listProducts(ProductStatus status, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("createdAt").descending());

        Page<Product> products = (status != null)
                ? productRepository.findAllByStatus(status, pageable)
                : productRepository.findAll(pageable);

        List<ProductSummaryResponse> content = products.getContent().stream()
                .map(ProductMapper::toSummary)
                .toList();

        return PagedResponse.<ProductSummaryResponse>builder()
                .content(content)
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    @Transactional
    public void removeProduct(Long productId, Long currentAdminId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        product.setStatus(ProductStatus.REMOVED);
        productRepository.save(product);
        log.info("Admin {} removed product {}", currentAdminId, productId);
    }

    @Transactional
    public void restoreProduct(Long productId, Long currentAdminId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        product.setStatus(ProductStatus.ACTIVE);
        productRepository.save(product);
        log.info("Admin {} restored product {}", currentAdminId, productId);
    }
}
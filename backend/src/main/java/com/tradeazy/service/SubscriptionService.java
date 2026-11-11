package com.tradeazy.service;

import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.SubscriptionResponse;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.Subscription;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.entity.enums.RoleName;
import com.tradeazy.entity.enums.SubscriptionStatus;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.repository.ProductRepository;
import com.tradeazy.repository.SubscriptionRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentService paymentService;

    public static final BigDecimal MONTHLY_PRICE   = new BigDecimal("5000");
    public static final BigDecimal QUARTERLY_PRICE = new BigDecimal("13500");
    public static final BigDecimal YEARLY_PRICE    = new BigDecimal("50000");

    private static final int MAX_PAGE_SIZE = 100;

    @Transactional(readOnly = true)
    public boolean hasActiveRent(Long sellerId) {
        return subscriptionRepository.hasActiveRent(sellerId, OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public SubscriptionResponse getCurrent(Long sellerId) {
        return subscriptionRepository
                .findFirstBySellerIdAndStatusOrderByExpiryDateDesc(sellerId, SubscriptionStatus.ACTIVE)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public SubscriptionResponse renew(Long sellerId, String plan) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + sellerId));

        String normalizedPlan = (plan == null || plan.isBlank()) ? "MONTHLY" : plan.toUpperCase();

        BigDecimal amount = switch (normalizedPlan) {
            case "MONTHLY"   -> MONTHLY_PRICE;
            case "QUARTERLY" -> QUARTERLY_PRICE;
            case "YEARLY"    -> YEARLY_PRICE;
            default          -> throw new IllegalArgumentException("Invalid plan: " + plan);
        };

        int durationDays = switch (normalizedPlan) {
            case "MONTHLY"   -> 30;
            case "QUARTERLY" -> 90;
            case "YEARLY"    -> 365;
            default          -> 30;
        };

        subscriptionRepository
                .findFirstBySellerIdAndStatusOrderByExpiryDateDesc(sellerId, SubscriptionStatus.ACTIVE)
                .ifPresent(existing -> {
                    existing.setStatus(SubscriptionStatus.EXPIRED);
                    subscriptionRepository.save(existing);
                    log.info("Previous subscription {} expired for seller {}", existing.getId(), sellerId);
                });

        PaymentService.PaymentResult result = paymentService.charge(
                sellerId, amount, "Rent - " + normalizedPlan
        );

        OffsetDateTime now = OffsetDateTime.now();

        Subscription subscription = Subscription.builder()
                .seller(seller)
                .plan(normalizedPlan)
                .amount(amount)
                .startDate(now)
                .expiryDate(now.plusDays(durationDays))
                .status(result.success() ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING)
                .paymentStatus(result.success() ? "PAID" : "FAILED")
                .transactionReference(result.reference())
                .build();

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Subscription created: id={}, seller={}, plan={}, expires={}",
                saved.getId(), sellerId, normalizedPlan, saved.getExpiryDate());

        // Reactivate existing EXPIRED products if they now have a new active subscription
        if (result.success()) {
            List<Product> expiredProducts = productRepository.findAllBySellerId(sellerId, Pageable.unpaged()).getContent();
            for (Product p : expiredProducts) {
                if (p.getStatus() == ProductStatus.EXPIRED) {
                    p.setStatus(ProductStatus.ACTIVE);
                    productRepository.save(p);
                }
            }
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<SubscriptionResponse> history(Long sellerId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Subscription> p = subscriptionRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);

        List<SubscriptionResponse> content = p.getContent().stream().map(this::toResponse).toList();

        return PagedResponse.<SubscriptionResponse>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    // ============================================================
    // SCHEDULED TASK: Runs every hour to expire products of unpaid sellers
    // ============================================================
    @Scheduled(fixedRate = 3600000) // Every 1 hour
    @Transactional
    public void expireUnpaidSellers() {
        log.info("Running scheduled task: expireUnpaidSellers");
        
        // Fixed: Use RoleName enum
        List<User> allSellers = userRepository.findAllByRole(RoleName.SELLER); 

        for (User seller : allSellers) {
            boolean hasRent = hasActiveRent(seller.getId());
            if (!hasRent) {
                Page<Product> activeProducts = productRepository.findAllBySellerId(seller.getId(), Pageable.unpaged());
                boolean changed = false;
                for (Product p : activeProducts.getContent()) {
                    if (p.getStatus() == ProductStatus.ACTIVE) {
                        p.setStatus(ProductStatus.EXPIRED);
                        productRepository.save(p);
                        changed = true;
                    }
                }
                if (changed) {
                    log.info("Expired products for seller {} (no active rent)", seller.getId());
                }
            }
        }
    }

    private SubscriptionResponse toResponse(Subscription s) {
        long days = 0;
        if (s.getStatus() == SubscriptionStatus.ACTIVE) {
            days = Math.max(0, Duration.between(OffsetDateTime.now(), s.getExpiryDate()).toDays());
        }
        return SubscriptionResponse.builder()
                .id(s.getId())
                .plan(s.getPlan())
                .amount(s.getAmount())
                .startDate(s.getStartDate())
                .expiryDate(s.getExpiryDate())
                .status(s.getStatus().name())
                .paymentStatus(s.getPaymentStatus())
                .transactionReference(s.getTransactionReference())
                .daysRemaining(days)
                .createdAt(s.getCreatedAt())
                .build();
    }
}
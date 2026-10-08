package com.tradeazy.service;

import com.tradeazy.dto.request.CreateOrderRequest;
import com.tradeazy.dto.response.OrderResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.entity.Order;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.OrderPaymentStatus;
import com.tradeazy.entity.enums.OrderStatus;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.exception.ForbiddenException;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.exception.ResourceNotFoundException;
import com.tradeazy.repository.OrderRepository;
import com.tradeazy.repository.ProductRepository;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;

    private static final int MAX_PAGE_SIZE = 100;

    // ============================================================
    // CREATE ORDER (buyer)
    // ============================================================
    @Transactional
    public OrderResponse create(Long buyerId, CreateOrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + request.getProductId()));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new InvalidOperationException("Product is not available for purchase");
        }

        if (product.getSeller().getId().equals(buyerId)) {
            throw new InvalidOperationException("You cannot buy your own product");
        }

        int qty = request.getQuantity() == null ? 1 : request.getQuantity();
        if (qty > product.getQuantity()) {
            throw new InvalidOperationException(
                    "Not enough stock. Only " + product.getQuantity() + " available");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

        User seller = product.getSeller();

        BigDecimal unitPrice = product.getEffectivePrice();
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(qty));

        // Charge via PaymentService (mock in dev)
        PaymentService.PaymentResult paymentResult = paymentService.charge(
                buyerId, total, "Order: " + product.getName());

        Order order = Order.builder()
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .quantity(qty)
                .unitPrice(unitPrice)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .paymentStatus(paymentResult.success()
                        ? OrderPaymentStatus.PAID
                        : OrderPaymentStatus.FAILED)
                .paymentReference(paymentResult.reference())
                .notes(request.getNotes())
                .build();

        Order saved = orderRepository.save(order);

        // Reduce stock; mark SOLD if quantity hits 0
        product.setQuantity(product.getQuantity() - qty);
        if (product.getQuantity() == 0) {
            product.setStatus(ProductStatus.SOLD);
        }
        productRepository.save(product);

        log.info("Order created: id={}, buyer={}, product={}, total={}",
                saved.getId(), buyerId, product.getId(), total);

        return toResponse(saved, buyerId);
    }

    // ============================================================
    // BUYER: list own orders
    // ============================================================
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> listForBuyer(Long buyerId, int page, int size) {
        Pageable pageable = buildPageable(page, size);
        Page<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId, pageable);
        return toPagedResponse(orders, buyerId);
    }

    // ============================================================
    // SELLER: list own orders
    // ============================================================
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> listForSeller(Long sellerId, int page, int size) {
        Pageable pageable = buildPageable(page, size);
        Page<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        return toPagedResponse(orders, sellerId);
    }

    // ============================================================
    // SINGLE order — buyer or seller of that order only
    // ============================================================
    @Transactional(readOnly = true)
    public OrderResponse get(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getBuyer().getId().equals(userId)
                && !order.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this order");
        }
        return toResponse(order, userId);
    }

    // ============================================================
    // SELLER: update order status
    // ============================================================
    @Transactional
    public OrderResponse updateStatus(Long orderId, Long sellerId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("You are not the seller of this order");
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot update a completed order");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot update a cancelled order");
        }

        // Validate transitions
        OrderStatus current = order.getStatus();
        boolean valid = switch (current) {
            case PENDING     -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED   -> newStatus == OrderStatus.PROCESSING || newStatus == OrderStatus.CANCELLED;
            case PROCESSING  -> newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.CANCELLED;
            default          -> false;
        };
        if (!valid) {
            throw new InvalidOperationException(
                    "Cannot transition from " + current + " to " + newStatus);
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        log.info("Order status updated: id={}, {} → {}", orderId, current, newStatus);
        return toResponse(saved, sellerId);
    }

    // ============================================================
    // BUYER: cancel own order (before seller confirms)
    // ============================================================
    @Transactional
    public OrderResponse cancel(Long orderId, Long buyerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new ForbiddenException("You are not the buyer of this order");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new InvalidOperationException(
                    "Only PENDING orders can be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        // Restore stock
        Product product = order.getProduct();
        product.setQuantity(product.getQuantity() + order.getQuantity());
        if (product.getStatus() == ProductStatus.SOLD) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        productRepository.save(product);

        log.info("Order cancelled: id={}, buyer={}", orderId, buyerId);
        return toResponse(saved, buyerId);
    }

    // ============================================================
    // Helpers
    // ============================================================
    private Pageable buildPageable(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize);
    }

    private PagedResponse<OrderResponse> toPagedResponse(Page<Order> page, Long currentUserId) {
        List<OrderResponse> content = page.getContent().stream()
                .map(o -> toResponse(o, currentUserId))
                .toList();

        return PagedResponse.<OrderResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private OrderResponse toResponse(Order o, Long currentUserId) {
        Product p = o.getProduct();
        String imageUrl = null;
        try {
            int size = p.getImages().size();
            if (size > 0) {
                imageUrl = p.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                        .findFirst()
                        .orElseGet(() -> p.getImages().get(0))
                        .getUrl();
            }
        } catch (Exception e) {
            imageUrl = null;
        }

        User b = o.getBuyer();
        User s = o.getSeller();

        return OrderResponse.builder()
                .id(o.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productImageUrl(imageUrl)
                .buyerId(b.getId())
                .buyerUsername(b.getUsername())
                .buyerFirstName(b.getFirstName())
                .buyerLastName(b.getLastName())
                .sellerId(s.getId())
                .sellerUsername(s.getUsername())
                .sellerFirstName(s.getFirstName())
                .sellerLastName(s.getLastName())
                .quantity(o.getQuantity())
                .unitPrice(o.getUnitPrice())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus().name())
                .paymentStatus(o.getPaymentStatus().name())
                .paymentReference(o.getPaymentReference())
                .notes(o.getNotes())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
package com.tradeazy.service;

import com.tradeazy.dto.request.CreateOrderRequest;
import com.tradeazy.dto.response.OrderResponse;
import com.tradeazy.entity.Order;
import com.tradeazy.entity.Product;
import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.OrderPaymentStatus;
import com.tradeazy.entity.enums.OrderStatus;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.exception.InvalidOperationException;
import com.tradeazy.repository.OrderRepository;
import com.tradeazy.repository.ProductRepository;
import com.tradeazy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private PaymentService paymentService;

    @InjectMocks
    private OrderService orderService;

    private User buyer;
    private User seller;
    private Product activeProduct;
    private PaymentService.PaymentResult successfulPayment;

    @BeforeEach
    void setUp() {
        buyer = User.builder()
                .id(10L)
                .firstName("Buyer").lastName("One")
                .username("buyer1")
                .email("buyer1@test.com")
                .phone("+2348011111111")
                .password("hashed")
                .build();

        seller = User.builder()
                .id(20L)
                .firstName("Seller").lastName("One")
                .username("seller1")
                .email("seller1@test.com")
                .phone("+2348022222222")
                .password("hashed")
                .build();

        activeProduct = Product.builder()
                .id(100L)
                .name("Test Laptop")
                .description("A good laptop")
                .price(new BigDecimal("500000"))
                .quantity(1)
                .status(ProductStatus.ACTIVE)
                .seller(seller)
                .build();

        successfulPayment = new PaymentService.PaymentResult(
                true, "MOCK-TEST-REF", "SUCCESS", "OK");
    }

    @Test
    @DisplayName("create: happy path — creates order, charges payment, marks product SOLD when stock hits 0")
    void create_happyPath() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .productId(100L)
                .quantity(1)
                .notes("Please deliver fast")
                .build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));
        when(userRepository.findById(10L)).thenReturn(Optional.of(buyer));
        when(paymentService.charge(anyLong(), any(), anyString())).thenReturn(successfulPayment);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(500L);
            return o;
        });

        OrderResponse response = orderService.create(10L, req);

        assertThat(response).isNotNull();
        assertThat(response.getProductId()).isEqualTo(100L);
        assertThat(response.getBuyerId()).isEqualTo(10L);
        assertThat(response.getSellerId()).isEqualTo(20L);
        assertThat(response.getQuantity()).isEqualTo(1);
        assertThat(response.getTotalAmount()).isEqualByComparingTo(new BigDecimal("500000"));
        assertThat(response.getStatus()).isEqualTo("PENDING");

        // Product becomes SOLD because quantity reached 0
        assertThat(activeProduct.getStatus()).isEqualTo(ProductStatus.SOLD);
        assertThat(activeProduct.getQuantity()).isEqualTo(0);

        verify(paymentService, times(1)).charge(eq(10L), any(), anyString());
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(productRepository, times(1)).save(activeProduct);
    }

    @Test
    @DisplayName("create: fails when product is not ACTIVE")
    void create_unavailableProduct_throws() {
        activeProduct.setStatus(ProductStatus.SOLD);

        CreateOrderRequest req = CreateOrderRequest.builder()
                .productId(100L).quantity(1).build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));

        assertThatThrownBy(() -> orderService.create(10L, req))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("not available");

        verify(orderRepository, never()).save(any());
        verify(paymentService, never()).charge(anyLong(), any(), anyString());
    }

    @Test
    @DisplayName("create: fails when buyer tries to buy their own product")
    void create_ownProduct_throws() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .productId(100L).quantity(1).build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));

        // Buyer id equals the seller's id
        assertThatThrownBy(() -> orderService.create(20L, req))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("your own product");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("create: fails when requested quantity exceeds stock")
    void create_insufficientStock_throws() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .productId(100L).quantity(5).build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));

        assertThatThrownBy(() -> orderService.create(10L, req))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Not enough stock");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancel: buyer can cancel a PENDING order")
    void cancel_pendingOrder_succeeds() {
        Order order = Order.builder()
                .id(500L)
                .buyer(buyer).seller(seller).product(activeProduct)
                .quantity(1)
                .unitPrice(new BigDecimal("500000"))
                .totalAmount(new BigDecimal("500000"))
                .status(OrderStatus.PENDING)
                .paymentStatus(OrderPaymentStatus.PAID)
                .build();

        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.cancel(500L, 10L);

        assertThat(response.getStatus()).isEqualTo("CANCELLED");
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("cancel: cannot cancel a COMPLETED order")
    void cancel_completedOrder_throws() {
        Order order = Order.builder()
                .id(500L)
                .buyer(buyer).seller(seller).product(activeProduct)
                .quantity(1)
                .unitPrice(new BigDecimal("500000"))
                .totalAmount(new BigDecimal("500000"))
                .status(OrderStatus.COMPLETED)
                .paymentStatus(OrderPaymentStatus.PAID)
                .build();

        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancel(500L, 10L))
                .isInstanceOf(InvalidOperationException.class);

        verify(orderRepository, never()).save(any());
    }
}
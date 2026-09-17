package com.example.orderservice;

import com.example.orderservice.dto.OrderItemRequest;
import com.example.orderservice.dto.OrderRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.ProductValidation;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.exception.ResourceNotFoundException;
import com.example.orderservice.feign.CatalogClient;
import com.example.orderservice.feign.NotificationClient;
import com.example.orderservice.service.OrderService;
import com.github.tomakehurst.wiremock.WireMockServer;
import feign.FeignException;
import feign.Request;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class OrderServicePaymentTest {

    private static final int WIREMOCK_PORT = 18083;

    static final WireMockServer WIREMOCK =
            new WireMockServer(options().port(WIREMOCK_PORT));

    static {
        WIREMOCK.start();
    }

    @Autowired
    private OrderService orderService;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @MockBean
    private CatalogClient catalogClient;

    @MockBean
    private NotificationClient notificationClient;

    @BeforeEach
    void setUp() {
        when(catalogClient.getProduct(anyLong())).thenReturn(
                new ProductValidation(1L, "Laptop", new BigDecimal("1500.00"), 10));
        WIREMOCK.resetRequests();
        WIREMOCK.resetAll();
    }

    @AfterEach
    void tearDown() {
        circuitBreakerRegistry.circuitBreaker("paymentService").reset();
    }

    @Test
    void shouldReturnDegradedFallbackAndOpenCircuitWhenPaymentServiceFails() {
        stubPaymentServiceFailure();

        for (int i = 0; i < 12; i++) {
            OrderResponse order = orderService.createOrder(validOrderRequest());
            assertThat(order.status()).isEqualTo(OrderStatus.PAGO_PENDIENTE);
        }

        CircuitBreaker circuitBreaker =
                circuitBreakerRegistry.circuitBreaker("paymentService");
        assertThat(circuitBreaker.getState()).isEqualTo(CircuitBreaker.State.OPEN);
        assertThat(circuitBreaker.getMetrics().getNumberOfFailedCalls()).isGreaterThanOrEqualTo(10);
    }

    @Test
    void shouldProcessPaymentAndCreatePaidOrderWhenServiceIsUp() {
        stubPaymentServiceApproved();

        OrderResponse order = orderService.createOrder(validOrderRequest());

        assertThat(order.status()).isEqualTo(OrderStatus.PAGADO);
        assertThat(order.total()).isEqualByComparingTo(new BigDecimal("3000.00"));
        assertThat(order.paymentReference()).isEqualTo("a1b2c3d4");
        WIREMOCK.verify(1, postRequestedFor(urlEqualTo("/payments/process")));
    }

    @Test
    void shouldReturnNotFoundWhenProductDoesNotExist() {
        when(catalogClient.getProduct(anyLong())).thenThrow(
                new FeignException.NotFound(
                        "Product not found",
                        Request.create(Request.HttpMethod.GET, "/api/products/999999",
                                Map.of(), null, StandardCharsets.UTF_8),
                        null,
                        Map.of()));

        assertThatThrownBy(() -> orderService.createOrder(validOrderRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product with id 1 not found");
    }

    @Test
    void shouldListAllOrders() {
        stubPaymentServiceApproved();
        OrderResponse paid = orderService.createOrder(validOrderRequest());

        WIREMOCK.resetAll();
        stubPaymentServiceFailure();
        OrderResponse pending = orderService.createOrder(validOrderRequest());
        assertThat(pending.status()).isEqualTo(OrderStatus.PAGO_PENDIENTE);

        List<OrderResponse> all = orderService.listOrders();

        assertThat(all).isNotEmpty();
        assertThat(all).extracting(OrderResponse::id)
                .contains(paid.id(), pending.id());
        assertThat(all).extracting(OrderResponse::status)
                .contains(OrderStatus.PAGADO, OrderStatus.PAGO_PENDIENTE);
    }

    @Test
    void shouldGetOrderById() {
        stubPaymentServiceApproved();

        OrderResponse created = orderService.createOrder(validOrderRequest());

        OrderResponse found = orderService.getOrder(created.id());

        assertThat(found.id()).isEqualTo(created.id());
        assertThat(found.status()).isEqualTo(OrderStatus.PAGADO);
    }

    @Test
    void shouldReturnNotFoundForUnknownOrder() {
        assertThatThrownBy(() -> orderService.getOrder(999_999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldConfirmPendingOrderAsPaid() {
        stubPaymentServiceFailure();

        OrderResponse pending = orderService.createOrder(validOrderRequest());
        assertThat(pending.status()).isEqualTo(OrderStatus.PAGO_PENDIENTE);
        assertThat(pending.paymentReference()).isNull();

        OrderResponse confirmed = orderService.confirmPayment(pending.id(), "ref12345", pending.total());

        assertThat(confirmed.status()).isEqualTo(OrderStatus.PAGADO);
        assertThat(confirmed.paymentReference()).isEqualTo("ref12345");
    }

    @Test
    void shouldBeIdempotentWhenConfirmingPaidOrder() {
        stubPaymentServiceApproved();

        OrderResponse paid = orderService.createOrder(validOrderRequest());

        OrderResponse again = orderService.confirmPayment(paid.id(), "another-ref", paid.total());

        assertThat(again.status()).isEqualTo(OrderStatus.PAGADO);
    }

    @Test
    void shouldSupportPartialPaymentsUntilFullyPaid() {
        stubPaymentServiceFailure();

        OrderResponse pending = orderService.createOrder(validOrderRequest());
        assertThat(pending.status()).isEqualTo(OrderStatus.PAGO_PENDIENTE);
        assertThat(pending.total()).isEqualByComparingTo(new BigDecimal("3000.00"));
        assertThat(pending.paidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(pending.remainingBalance()).isEqualByComparingTo(new BigDecimal("3000.00"));

        // Primer abono parcial de 1000.00
        OrderResponse partial = orderService.confirmPayment(pending.id(), "ref-part-1", new BigDecimal("1000.00"));
        assertThat(partial.status()).isEqualTo(OrderStatus.PAGO_PARCIAL);
        assertThat(partial.paidAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));
        assertThat(partial.remainingBalance()).isEqualByComparingTo(new BigDecimal("2000.00"));

        // Segundo abono de 2000.00 que completa el total
        OrderResponse completed = orderService.confirmPayment(pending.id(), "ref-part-2", new BigDecimal("2000.00"));
        assertThat(completed.status()).isEqualTo(OrderStatus.PAGADO);
        assertThat(completed.paidAmount()).isEqualByComparingTo(new BigDecimal("3000.00"));
        assertThat(completed.remainingBalance()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void shouldRejectConfirmWhenAmountExceedsRemainingBalance() {
        stubPaymentServiceFailure();

        OrderResponse pending = orderService.createOrder(validOrderRequest());

        assertThatThrownBy(() ->
                orderService.confirmPayment(pending.id(), "ref12345", new BigDecimal("3500.00")))
                .isInstanceOf(com.example.orderservice.exception.InvalidPaymentAmountException.class)
                .hasMessageContaining("Payment amount (3500.00) exceeds remaining balance (3000.00)");
    }

    private void stubPaymentServiceFailure() {
        WIREMOCK.stubFor(post(urlEqualTo("/payments/process"))
                .willReturn(aResponse()
                        .withStatus(500)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"REJECTED\",\"success\":false,\"message\":\"boom\"}")));
    }

    private void stubPaymentServiceApproved() {
        WIREMOCK.stubFor(post(urlEqualTo("/payments/process"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"APPROVED\",\"success\":true,\"message\":\"ok\","
                                + "\"reference\":\"a1b2c3d4\"}")));
    }

    private OrderRequest validOrderRequest() {
        return new OrderRequest(
                "Ana Perez",
                List.of(new OrderItemRequest(1L, 2)));
    }
}
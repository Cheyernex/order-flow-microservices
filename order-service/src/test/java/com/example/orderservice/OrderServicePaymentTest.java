package com.example.orderservice;

import com.example.orderservice.dto.OrderItemRequest;
import com.example.orderservice.dto.OrderRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.ProductValidation;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.exception.OrderNotPayableException;
import com.example.orderservice.exception.ResourceNotFoundException;
import com.example.orderservice.feign.CatalogClient;
import com.example.orderservice.feign.NotificationClient;
import com.example.orderservice.service.OrderService;
import com.github.tomakehurst.wiremock.WireMockServer;
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
import java.util.List;

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
        WIREMOCK.verify(1, postRequestedFor(urlEqualTo("/payments/process")));
    }

    @Test
    void shouldMarkPendingOrderAsPaidWhenRetrySucceeds() {
        stubPaymentServiceFailure();

        OrderResponse pending = orderService.createOrder(validOrderRequest());
        assertThat(pending.status()).isEqualTo(OrderStatus.PAGO_PENDIENTE);

        WIREMOCK.resetAll();
        stubPaymentServiceApproved();

        OrderResponse paid = orderService.payOrder(pending.id());

        assertThat(paid.status()).isEqualTo(OrderStatus.PAGADO);
        assertThat(paid.id()).isEqualTo(pending.id());
    }

    @Test
    void shouldRejectPayingOrderThatIsAlreadyPaid() {
        stubPaymentServiceApproved();

        OrderResponse paid = orderService.createOrder(validOrderRequest());
        assertThat(paid.status()).isEqualTo(OrderStatus.PAGADO);

        assertThatThrownBy(() -> orderService.payOrder(paid.id()))
                .isInstanceOf(OrderNotPayableException.class)
                .hasMessageContaining("PAGADO");

        WIREMOCK.verify(1, postRequestedFor(urlEqualTo("/payments/process")));
    }

    @Test
    void shouldRejectPayingUnknownOrder() {
        assertThatThrownBy(() -> orderService.payOrder(999_999L))
                .isInstanceOf(ResourceNotFoundException.class);

        WIREMOCK.verify(0, postRequestedFor(urlEqualTo("/payments/process")));
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
                        .withBody("{\"status\":\"APPROVED\",\"success\":true,\"message\":\"ok\"}")));
    }

    private OrderRequest validOrderRequest() {
        return new OrderRequest(
                "Ana Perez",
                List.of(new OrderItemRequest(1L, 2)));
    }
}

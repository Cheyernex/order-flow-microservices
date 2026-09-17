package com.example.orderservice;

import com.example.orderservice.dto.OrderItemRequest;
import com.example.orderservice.dto.OrderRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.ProductValidation;
import com.example.orderservice.entity.OrderStatus;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class PaymentCircuitBreakerTest {

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
        WIREMOCK.stubFor(post(urlEqualTo("/payments/process"))
                .willReturn(aResponse()
                        .withStatus(500)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"FAILED\",\"success\":false,\"message\":\"boom\"}")));

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
        WIREMOCK.stubFor(post(urlEqualTo("/payments/process"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"APPROVED\",\"success\":true,\"message\":\"ok\"}")));

        OrderResponse order = orderService.createOrder(validOrderRequest());

        assertThat(order.status()).isEqualTo(OrderStatus.PAGADO);
        assertThat(order.total()).isEqualByComparingTo(new BigDecimal("3000.00"));
        WIREMOCK.verify(1, postRequestedFor(urlEqualTo("/payments/process")));
    }

    private OrderRequest validOrderRequest() {
        return new OrderRequest(
                "Ana Perez",
                List.of(new OrderItemRequest(1L, 2)));
    }
}
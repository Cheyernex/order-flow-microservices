package com.example.paymentservice.service;

import com.example.paymentservice.dto.OrderSummaryResponse;
import com.example.paymentservice.dto.PaymentConfirmationRequest;
import com.example.paymentservice.feign.OrderClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderConfirmer {

    private static final Logger log = LoggerFactory.getLogger(OrderConfirmer.class);

    private final OrderClient orderClient;

    public OrderConfirmer(OrderClient orderClient) {
        this.orderClient = orderClient;
    }

    @CircuitBreaker(name = "orderService", fallbackMethod = "confirmFallback")
    public OrderSummaryResponse confirm(Long orderId, String reference, BigDecimal amount) {
        return orderClient.confirmPayment(orderId, new PaymentConfirmationRequest(reference, amount));
    }

    public OrderSummaryResponse confirmFallback(Long orderId, String reference, BigDecimal amount, Throwable throwable) {
        log.warn("Order confirmation for order {} (reference {}, amount {}) failed: {}. "
                + "The payment stays recorded.", orderId, reference, amount, throwable.getMessage());
        return null;
    }
}
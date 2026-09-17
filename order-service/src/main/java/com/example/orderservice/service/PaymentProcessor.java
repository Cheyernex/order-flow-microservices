package com.example.orderservice.service;

import com.example.orderservice.dto.PaymentRequest;
import com.example.orderservice.dto.PaymentResponse;
import com.example.orderservice.feign.PaymentClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PaymentProcessor {

    private static final Logger log = LoggerFactory.getLogger(PaymentProcessor.class);

    private final PaymentClient paymentClient;

    public PaymentProcessor(PaymentClient paymentClient) {
        this.paymentClient = paymentClient;
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    public PaymentResponse process(PaymentRequest request) {
        return paymentClient.processPayment(request);
    }

    public PaymentResponse paymentFallback(PaymentRequest request, Throwable throwable) {
        log.warn("Payment service unavailable or circuit breaker OPEN (orderId={}, cause={}). "
                + "Falling back to PAGO_PENDIENTE.", request.orderId(), throwable.getClass().getSimpleName());
        return PaymentResponse.pending();
    }
}
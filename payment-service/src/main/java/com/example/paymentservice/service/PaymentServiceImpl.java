package com.example.paymentservice.service;

import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;
import com.example.paymentservice.exception.PaymentProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private static final double FAILURE_RATE = 0.30;

    @Override
    public PaymentResponse process(PaymentRequest request) {
        simulateLatency();
        maybeFail(request);

        Long transactionId = ThreadLocalRandom.current().nextLong(1_000_000L, 9_999_999L);
        log.info("Payment approved for order {} (amount {}): transaction {}",
                request.orderId(), request.amount(), transactionId);
        return PaymentResponse.approved(transactionId, request.orderId(), request.amount());
    }

    private void simulateLatency() {
        int latencyMs = ThreadLocalRandom.current().nextInt(200, 801);
        try {
            Thread.sleep(latencyMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Payment processing interrupted", e);
        }
    }

    private void maybeFail(PaymentRequest request) {
        if (ThreadLocalRandom.current().nextDouble() < FAILURE_RATE) {
            log.warn("Simulated payment failure for order {}", request.orderId());
            throw new PaymentProcessingException("Payment gateway unavailable (simulated)");
        }
    }
}
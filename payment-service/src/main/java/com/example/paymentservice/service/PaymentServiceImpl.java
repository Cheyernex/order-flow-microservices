package com.example.paymentservice.service;

import com.example.paymentservice.config.PaymentSimulationProperties;
import com.example.paymentservice.dto.PaymentDetailResponse;
import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;
import com.example.paymentservice.dto.PaymentStatus;
import com.example.paymentservice.entity.Payment;
import com.example.paymentservice.exception.OrderAlreadyPaidException;
import com.example.paymentservice.exception.PaymentNotFoundException;
import com.example.paymentservice.exception.PaymentProcessingException;
import com.example.paymentservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final PaymentReferenceGenerator referenceGenerator;
    private final PaymentSimulationProperties simulation;
    private final OrderConfirmer orderConfirmer;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              PaymentReferenceGenerator referenceGenerator,
                              PaymentSimulationProperties simulation,
                              OrderConfirmer orderConfirmer) {
        this.paymentRepository = paymentRepository;
        this.referenceGenerator = referenceGenerator;
        this.simulation = simulation;
        this.orderConfirmer = orderConfirmer;
    }

    @Override
    public PaymentResponse process(PaymentRequest request) {
        if (paymentRepository.existsByOrderIdAndStatus(request.orderId(), PaymentStatus.APPROVED)) {
            throw new OrderAlreadyPaidException(
                    "Order " + request.orderId() + " has already been paid");
        }

        simulateLatency();
        boolean success = !shouldFail();

        String reference = referenceGenerator.generate(request.orderId(), request.amount());
        PaymentStatus status = success ? PaymentStatus.APPROVED : PaymentStatus.REJECTED;
        String message = success
                ? "Payment processed successfully"
                : "Payment gateway unavailable (simulated)";

        Payment payment = new Payment(
                reference, request.orderId(), request.amount(), status, message, Instant.now());
        paymentRepository.save(payment);
        log.info("Payment {} for order {} (amount {}) recorded as {}",
                reference, request.orderId(), request.amount(), status);

        if (!success) {
            throw new PaymentProcessingException(message, reference);
        }

        orderConfirmer.confirm(request.orderId(), reference, request.amount());

        Long transactionId = ThreadLocalRandom.current().nextLong(1_000_000L, 9_999_999L);
        return PaymentResponse.approved(reference, transactionId, request.orderId(), request.amount());
    }

    @Override
    public PaymentDetailResponse findByReference(String reference) {
        return paymentRepository.findByReference(reference)
                .map(PaymentDetailResponse::from)
                .orElseThrow(() -> new PaymentNotFoundException(
                        "Payment with reference " + reference + " not found"));
    }

    @Override
    public List<PaymentDetailResponse> findAll() {
        return paymentRepository.findLatestPerOrder().stream()
                .map(PaymentDetailResponse::from)
                .toList();
    }

    private void simulateLatency() {
        int min = simulation.getMinLatencyMs();
        int max = simulation.getMaxLatencyMs();
        if (max <= 0) {
            return;
        }
        int latencyMs = min >= max ? min : ThreadLocalRandom.current().nextInt(min, max + 1);
        try {
            Thread.sleep(latencyMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Payment processing interrupted", e);
        }
    }

    private boolean shouldFail() {
        return ThreadLocalRandom.current().nextDouble() < simulation.getFailureRate();
    }
}

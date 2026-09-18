package com.example.paymentservice.service;

import com.example.paymentservice.config.PaymentSimulationProperties;
import com.example.paymentservice.dto.OrderSummaryResponse;
import com.example.paymentservice.dto.PaymentDetailResponse;
import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;
import com.example.paymentservice.dto.PaymentStatus;
import com.example.paymentservice.entity.Payment;
import com.example.paymentservice.exception.InvalidPaymentAmountException;
import com.example.paymentservice.exception.OrderAlreadyPaidException;
import com.example.paymentservice.exception.PaymentNotFoundException;
import com.example.paymentservice.exception.PaymentProcessingException;
import com.example.paymentservice.feign.OrderClient;
import com.example.paymentservice.repository.PaymentRepository;
import feign.FeignException;
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
    private final OrderClient orderClient;
    private final com.example.paymentservice.publisher.PaymentEventPublisher paymentEventPublisher;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              PaymentReferenceGenerator referenceGenerator,
                              PaymentSimulationProperties simulation,
                              OrderConfirmer orderConfirmer,
                              OrderClient orderClient,
                              com.example.paymentservice.publisher.PaymentEventPublisher paymentEventPublisher) {
        this.paymentRepository = paymentRepository;
        this.referenceGenerator = referenceGenerator;
        this.simulation = simulation;
        this.orderConfirmer = orderConfirmer;
        this.orderClient = orderClient;
        this.paymentEventPublisher = paymentEventPublisher;
    }

    @Override
    public PaymentResponse process(PaymentRequest request) {
        // Pre-validate against order status and remaining balance
        try {
            OrderSummaryResponse order = orderClient.getOrder(request.orderId());
            if (order != null) {
                if ("PAGADO".equalsIgnoreCase(order.status())) {
                    throw new OrderAlreadyPaidException(
                            "Order " + request.orderId() + " has already been fully paid");
                }
                if (order.remainingBalance() != null && request.amount().compareTo(order.remainingBalance()) > 0) {
                    throw new InvalidPaymentAmountException(
                            "Payment amount (" + request.amount() + ") exceeds remaining balance (" + order.remainingBalance() + ") for order " + request.orderId());
                }
            }
        } catch (FeignException.NotFound ex) {
            throw new PaymentNotFoundException("Order with id " + request.orderId() + " not found");
        } catch (OrderAlreadyPaidException | InvalidPaymentAmountException | PaymentNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Could not reach order-service to pre-validate order {}: {}", request.orderId(), ex.getMessage());
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

        paymentEventPublisher.publishPaymentProcessed(new com.example.paymentservice.event.PaymentProcessedEvent(
                reference,
                request.orderId(),
                request.amount(),
                status,
                message,
                Instant.now()
        ));

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

package com.example.paymentservice.service;

import com.example.paymentservice.config.PaymentSimulationProperties;
import com.example.paymentservice.dto.PaymentConfirmationRequest;
import com.example.paymentservice.dto.PaymentDetailResponse;
import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;
import com.example.paymentservice.dto.PaymentStatus;
import com.example.paymentservice.exception.PaymentNotFoundException;
import com.example.paymentservice.exception.PaymentProcessingException;
import com.example.paymentservice.feign.OrderClient;
import com.example.paymentservice.repository.PaymentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@SpringBootTest
@ActiveProfiles("test")
class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentSimulationProperties simulation;

    @MockBean
    private OrderClient orderClient;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        tuneSimulation(0.0);
    }

    @AfterEach
    void tearDown() {
        tuneSimulation(0.0);
    }

    @Test
    void shouldPersistApprovedPaymentAndLookItUpByReference() {
        PaymentResponse response =
                paymentService.process(new PaymentRequest(10L, new BigDecimal("1500.00")));

        assertThat(response.success()).isTrue();
        assertThat(response.status()).isEqualTo(PaymentStatus.APPROVED);
        assertThat(response.reference()).matches("[0-9a-f]{64}");

        verify(orderClient).confirmPayment(eq(10L), argThat(req ->
                req.reference().equals(response.reference())));

        PaymentDetailResponse detail = paymentService.findByReference(response.reference());

        assertThat(detail.reference()).isEqualTo(response.reference());
        assertThat(detail.orderId()).isEqualTo(10L);
        assertThat(detail.amount()).isEqualByComparingTo("1500.00");
        assertThat(detail.status()).isEqualTo(PaymentStatus.APPROVED);
        assertThat(detail.success()).isTrue();
        assertThat(detail.createdAt()).isNotNull();
    }

    @Test
    void shouldPersistRejectedPaymentWhenGatewayFails() {
        tuneSimulation(1.0);

        assertThatThrownBy(() ->
                paymentService.process(new PaymentRequest(11L, new BigDecimal("99.50"))))
                .isInstanceOf(PaymentProcessingException.class)
                .satisfies(ex -> assertThat(((PaymentProcessingException) ex).getReference())
                        .matches("[0-9a-f]{64}"));

        verify(orderClient, never()).confirmPayment(anyLong(), any(PaymentConfirmationRequest.class));

        assertThat(paymentRepository.findAll())
                .hasSize(1)
                .allSatisfy(payment -> {
                    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.REJECTED);
                    assertThat(payment.getOrderId()).isEqualTo(11L);
                });
    }

    @Test
    void shouldGenerateUniqueReferencePerAttempt() {
        PaymentResponse first =
                paymentService.process(new PaymentRequest(20L, new BigDecimal("10.00")));
        PaymentResponse second =
                paymentService.process(new PaymentRequest(21L, new BigDecimal("10.00")));

        assertThat(first.reference()).isNotEqualTo(second.reference());
    }

    @Test
    void shouldFailLookupForUnknownReference() {
        assertThatThrownBy(() -> paymentService.findByReference("deadbeef"))
                .isInstanceOf(PaymentNotFoundException.class);
    }

    @Test
    void shouldListAllPaymentsWithTheirStatuses() {
        // Orden 100: primero falla (REJECTED)
        tuneSimulation(1.0);
        try {
            paymentService.process(new PaymentRequest(100L, new BigDecimal("250.00")));
        } catch (PaymentProcessingException ignored) {
        }

        // Orden 101: solo falla (REJECTED)
        try {
            paymentService.process(new PaymentRequest(101L, new BigDecimal("75.00")));
        } catch (PaymentProcessingException ignored) {
        }

        // Orden 100: reintento exitoso (APPROVED)
        tuneSimulation(0.0);
        paymentService.process(new PaymentRequest(100L, new BigDecimal("250.00")));

        var list = paymentService.findAll();
        // Debe haber exactamente 2 entradas (una por cada orden), con orden 100 en APPROVED y 101 en REJECTED
        assertThat(list).hasSize(2);
        assertThat(list).extracting(PaymentDetailResponse::orderId)
                .containsExactly(100L, 101L);
        assertThat(list).extracting(PaymentDetailResponse::status)
                .containsExactly(PaymentStatus.APPROVED, PaymentStatus.REJECTED);
    }

    @Test
    void shouldRejectPaymentWhenOrderAlreadyPaid() {
        paymentService.process(new PaymentRequest(50L, new BigDecimal("500.00")));

        assertThatThrownBy(() ->
                paymentService.process(new PaymentRequest(50L, new BigDecimal("500.00"))))
                .isInstanceOf(com.example.paymentservice.exception.OrderAlreadyPaidException.class)
                .hasMessageContaining("Order 50 has already been paid");
    }

    private void tuneSimulation(double failureRate) {
        simulation.setFailureRate(failureRate);
        simulation.setMinLatencyMs(0);
        simulation.setMaxLatencyMs(0);
    }
}

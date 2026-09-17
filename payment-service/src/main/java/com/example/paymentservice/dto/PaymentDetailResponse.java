package com.example.paymentservice.dto;

import com.example.paymentservice.entity.Payment;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentDetailResponse(
        String reference,
        PaymentStatus status,
        boolean success,
        String message,
        Long orderId,
        BigDecimal amount,
        Instant createdAt) {

    public static PaymentDetailResponse from(Payment payment) {
        return new PaymentDetailResponse(
                payment.getReference(),
                payment.getStatus(),
                payment.getStatus() == PaymentStatus.APPROVED,
                payment.getMessage(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getCreatedAt());
    }
}

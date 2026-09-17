package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record PaymentResponse(
        PaymentStatus status,
        boolean success,
        String message,
        Long transactionId,
        Long orderId,
        BigDecimal amount) {

    public static PaymentResponse approved(Long transactionId, Long orderId, BigDecimal amount) {
        return new PaymentResponse(
                PaymentStatus.APPROVED,
                true,
                "Payment processed successfully",
                transactionId,
                orderId,
                amount);
    }
}
package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record PaymentResponse(
        String status,
        boolean success,
        String message,
        Long transactionId,
        Long orderId,
        BigDecimal amount) {

    public static PaymentResponse approved(Long transactionId, Long orderId, BigDecimal amount) {
        return new PaymentResponse(
                "APPROVED",
                true,
                "Payment processed successfully",
                transactionId,
                orderId,
                amount);
    }

    public static PaymentResponse failed(String reason, Long orderId, BigDecimal amount) {
        return new PaymentResponse(
                "REJECTED",
                false,
                reason,
                null,
                orderId,
                amount);
    }
}
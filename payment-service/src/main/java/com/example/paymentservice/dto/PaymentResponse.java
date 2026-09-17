package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record PaymentResponse(
        PaymentStatus status,
        boolean success,
        String message,
        String reference,
        Long transactionId,
        Long orderId,
        BigDecimal amount) {

    public static PaymentResponse approved(String reference,
                                           Long transactionId,
                                           Long orderId,
                                           BigDecimal amount) {
        return new PaymentResponse(
                PaymentStatus.APPROVED,
                true,
                "Payment processed successfully",
                reference,
                transactionId,
                orderId,
                amount);
    }
}

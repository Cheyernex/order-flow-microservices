package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record PaymentResponse(
        PaymentStatus status,
        boolean success,
        String message,
        String reference,
        Long transactionId,
        Long orderId,
        BigDecimal amount,
        BigDecimal paidAmount,
        BigDecimal remainingBalance,
        String orderStatus) {

    public static PaymentResponse approved(String reference,
                                           Long transactionId,
                                           Long orderId,
                                           BigDecimal amount,
                                           BigDecimal paidAmount,
                                           BigDecimal remainingBalance,
                                           String orderStatus) {
        return new PaymentResponse(
                PaymentStatus.APPROVED,
                true,
                "Payment processed successfully",
                reference,
                transactionId,
                orderId,
                amount,
                paidAmount,
                remainingBalance,
                orderStatus);
    }

    public static PaymentResponse approved(String reference,
                                           Long transactionId,
                                           Long orderId,
                                           BigDecimal amount) {
        return approved(reference, transactionId, orderId, amount, amount, BigDecimal.ZERO, "PAGADO");
    }
}

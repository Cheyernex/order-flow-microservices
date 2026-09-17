package com.example.orderservice.dto;

public record PaymentResponse(
        PaymentStatus status,
        boolean success,
        String message,
        String reference) {

    public static PaymentResponse unavailable() {
        return new PaymentResponse(
                PaymentStatus.UNAVAILABLE, false,
                "Payment service unavailable, order kept with pending payment",
                null);
    }
}

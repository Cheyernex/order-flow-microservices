package com.example.orderservice.dto;

public record PaymentResponse(
        PaymentStatus status,
        boolean success,
        String message) {

    public static PaymentResponse approved() {
        return new PaymentResponse(
                PaymentStatus.APPROVED, true, "Payment processed successfully");
    }

    public static PaymentResponse unavailable() {
        return new PaymentResponse(
                PaymentStatus.UNAVAILABLE, false,
                "Payment service unavailable, order kept with pending payment");
    }
}
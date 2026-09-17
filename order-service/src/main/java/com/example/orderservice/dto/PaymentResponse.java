package com.example.orderservice.dto;

public record PaymentResponse(
        String status,
        boolean success,
        String message) {

    public static PaymentResponse approved() {
        return new PaymentResponse("APPROVED", true, "Payment processed successfully");
    }

    public static PaymentResponse pending() {
        return new PaymentResponse("PAGO_PENDIENTE", false,
                "Payment service unavailable, order kept with pending payment");
    }
}
package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record PaymentConfirmationRequest(
        String reference,
        BigDecimal amount) {
}
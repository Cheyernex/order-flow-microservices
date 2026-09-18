package com.example.paymentservice.event;

import com.example.paymentservice.dto.PaymentStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentProcessedEvent(
        String reference,
        Long orderId,
        BigDecimal amount,
        PaymentStatus status,
        String message,
        Instant timestamp
) implements Serializable {}

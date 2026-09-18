package com.example.notificationservice.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentProcessedEvent(
        String reference,
        Long orderId,
        BigDecimal amount,
        String status,
        String message,
        Instant timestamp
) implements Serializable {
}

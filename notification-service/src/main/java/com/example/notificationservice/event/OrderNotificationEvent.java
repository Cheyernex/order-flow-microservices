package com.example.notificationservice.event;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderNotificationEvent(
        Long orderId,
        String customerName,
        String status,
        String message,
        BigDecimal total,
        BigDecimal paidAmount,
        BigDecimal remainingBalance,
        Instant timestamp
) {
}

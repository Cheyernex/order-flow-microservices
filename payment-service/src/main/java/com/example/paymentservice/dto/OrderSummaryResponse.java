package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record OrderSummaryResponse(
        Long id,
        String customerName,
        BigDecimal total,
        BigDecimal paidAmount,
        BigDecimal remainingBalance,
        String status
) {
}

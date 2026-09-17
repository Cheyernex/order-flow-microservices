package com.example.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record NotificationRequest(
        @NotNull(message = "orderId is required")
        @Positive(message = "orderId must be positive")
        Long orderId,

        @NotBlank(message = "customerName is required")
        String customerName,

        @NotBlank(message = "status is required")
        String status,

        @NotBlank(message = "message is required")
        String message) {
}
package com.example.orderservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderItemRequest(
        @NotNull(message = "productId is required")
        @Positive(message = "productId must be positive")
        Long productId,

        @NotNull(message = "quantity is required")
        @Positive(message = "quantity must be positive")
        Integer quantity) {
}
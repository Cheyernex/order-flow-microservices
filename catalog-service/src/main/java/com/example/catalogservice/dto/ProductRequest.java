package com.example.catalogservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "name is required")
        String name,

        @NotNull(message = "price is required")
        @Positive(message = "price must be positive")
        BigDecimal price,

        @NotNull(message = "stock is required")
        @PositiveOrZero(message = "stock must be zero or positive")
        Integer stock) {
}
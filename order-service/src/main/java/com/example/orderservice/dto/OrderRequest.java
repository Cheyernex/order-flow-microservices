package com.example.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record OrderRequest(
        @NotBlank(message = "customerName is required")
        String customerName,

        @NotEmpty(message = "items must not be empty")
        List<@Valid OrderItemRequest> items) {
}
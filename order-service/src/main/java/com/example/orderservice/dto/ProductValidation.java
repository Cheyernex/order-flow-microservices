package com.example.orderservice.dto;

import java.math.BigDecimal;

public record ProductValidation(
        Long id,
        String name,
        BigDecimal price,
        Integer stock) {
}
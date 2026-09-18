package com.example.notificationservice.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

public record ProductCreatedEvent(
        Long id,
        String name,
        BigDecimal price,
        Integer stock,
        Instant timestamp
) implements Serializable {
}

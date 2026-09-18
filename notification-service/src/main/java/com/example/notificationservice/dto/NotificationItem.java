package com.example.notificationservice.dto;

import java.time.Instant;

public record NotificationItem(
        String id,
        String type,
        String title,
        String message,
        String status,
        Instant timestamp
) {}

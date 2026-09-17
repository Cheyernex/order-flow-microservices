package com.example.notificationservice.dto;

import java.time.Instant;

public record NotificationResponse(
        String status,
        String message,
        Long notificationId,
        Instant sentAt) {

    public static NotificationResponse sent(Long notificationId, String message) {
        return new NotificationResponse("SENT", message, notificationId, Instant.now());
    }
}
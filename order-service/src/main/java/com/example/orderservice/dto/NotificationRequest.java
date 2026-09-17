package com.example.orderservice.dto;

public record NotificationRequest(
        Long orderId,
        String customerName,
        String status,
        String message) {
}
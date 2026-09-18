package com.example.notificationservice.service;

import com.example.notificationservice.dto.NotificationItem;
import com.example.notificationservice.dto.NotificationRequest;
import com.example.notificationservice.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse notify(NotificationRequest request);

    void recordNotification(String type, String title, String message, String status);

    List<NotificationItem> getRecentNotifications();
}
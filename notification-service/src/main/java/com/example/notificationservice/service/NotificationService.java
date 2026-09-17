package com.example.notificationservice.service;

import com.example.notificationservice.dto.NotificationRequest;
import com.example.notificationservice.dto.NotificationResponse;

public interface NotificationService {

    NotificationResponse notify(NotificationRequest request);
}
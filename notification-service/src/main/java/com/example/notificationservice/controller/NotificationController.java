package com.example.notificationservice.controller;

import com.example.notificationservice.dto.NotificationRequest;
import com.example.notificationservice.dto.NotificationResponse;
import com.example.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notificaciones", description = "Envío de notificaciones (simulado)")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public NotificationResponse notify(@Valid @RequestBody NotificationRequest request) {
        return notificationService.notify(request);
    }
}
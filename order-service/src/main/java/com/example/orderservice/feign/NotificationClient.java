package com.example.orderservice.feign;

import com.example.orderservice.dto.NotificationRequest;
import com.example.orderservice.dto.NotificationResult;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/notifications")
    NotificationResult sendNotification(@RequestBody NotificationRequest request);
}
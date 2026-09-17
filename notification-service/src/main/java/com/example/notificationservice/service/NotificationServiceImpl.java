package com.example.notificationservice.service;

import com.example.notificationservice.dto.NotificationRequest;
import com.example.notificationservice.dto.NotificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Override
    public NotificationResponse notify(NotificationRequest request) {
        Long notificationId = ThreadLocalRandom.current().nextLong(1_000_000L, 9_999_999L);
        log.info("SIMULATED NOTIFICATION | notificationId={} | orderId={} | customer={} | status={} | message={}",
                notificationId,
                request.orderId(),
                request.customerName(),
                request.status(),
                request.message());
        return NotificationResponse.sent(notificationId, request.message());
    }
}
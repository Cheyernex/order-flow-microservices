package com.example.notificationservice.service;

import com.example.notificationservice.dto.NotificationItem;
import com.example.notificationservice.dto.NotificationRequest;
import com.example.notificationservice.dto.NotificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private static final int MAX_HISTORY = 50;

    private final ConcurrentLinkedDeque<NotificationItem> history = new ConcurrentLinkedDeque<>();

    @Override
    public NotificationResponse notify(NotificationRequest request) {
        Long notificationId = ThreadLocalRandom.current().nextLong(1_000_000L, 9_999_999L);
        log.info("SIMULATED NOTIFICATION | notificationId={} | orderId={} | customer={} | status={} | message={}",
                notificationId,
                request.orderId(),
                request.customerName(),
                request.status(),
                request.message());

        recordNotification("ORDER", "Actualización de Pedido #" + request.orderId(),
                request.message() + " (" + request.customerName() + ")",
                request.status() != null ? request.status().name() : "INFO");

        return NotificationResponse.sent(notificationId, request.message());
    }

    @Override
    public void recordNotification(String type, String title, String message, String status) {
        NotificationItem item = new NotificationItem(
                UUID.randomUUID().toString().substring(0, 8),
                type,
                title,
                message,
                status,
                Instant.now()
        );
        history.addFirst(item);
        while (history.size() > MAX_HISTORY) {
            history.removeLast();
        }
    }

    @Override
    public List<NotificationItem> getRecentNotifications() {
        return new ArrayList<>(history);
    }
}
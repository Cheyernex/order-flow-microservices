package com.example.notificationservice.listener;

import com.example.notificationservice.config.RabbitMQConfig;
import com.example.notificationservice.event.PaymentProcessedEvent;
import com.example.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentNotificationListener.class);

    private final NotificationService notificationService;

    public PaymentNotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_NOTIFICATION_QUEUE)
    public void handlePaymentProcessedNotification(PaymentProcessedEvent event) {
        log.info("================ PAYMENT NOTIFICATION RECEIVED (AMQP/RabbitMQ) ================");
        log.info("Payment Reference: {}", event.reference());
        log.info("Order ID:          {}", event.orderId());
        log.info("Amount:            ${}", event.amount());
        log.info("Payment Status:    {}", event.status());
        log.info("Gateway Message:   {}", event.message());
        log.info("Timestamp:         {}", event.timestamp());
        log.info("Simulated Notification (Receipt/Payment Confirmation) sent to customer.");
        log.info("===============================================================================");

        String statusStr = event.status() != null ? event.status().toString() : "PROCESSED";
        notificationService.recordNotification(
                "PAYMENT",
                "Pago de $" + event.amount() + " para Orden #" + event.orderId() + " (" + statusStr + ")",
                event.message() + " | Ref: " + (event.reference() != null && event.reference().length() > 16 ? event.reference().substring(0, 16) + "..." : event.reference()),
                statusStr
        );
    }
}

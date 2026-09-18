package com.example.notificationservice.listener;

import com.example.notificationservice.config.RabbitMQConfig;
import com.example.notificationservice.event.OrderNotificationEvent;
import com.example.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(OrderNotificationListener.class);

    private final NotificationService notificationService;

    public OrderNotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitMQConfig.ORDER_NOTIFICATION_QUEUE)
    public void handleOrderNotification(OrderNotificationEvent event) {
        log.info("================ NOTIFICATION RECEIVED (AMQP/RabbitMQ) ================");
        log.info("Order ID:         {}", event.orderId());
        log.info("Customer:         {}", event.customerName());
        log.info("Status:           {}", event.status());
        log.info("Message:          {}", event.message());
        log.info("Financial Total:  ${}", event.total());
        log.info("Paid Amount:      ${}", event.paidAmount());
        log.info("Balance Due:      ${}", event.remainingBalance());
        log.info("Timestamp:        {}", event.timestamp());
        log.info("Simulated Notification (SMS/Email) dispatched successfully to customer.");
        log.info("=======================================================================");

        notificationService.recordNotification(
                "ORDER",
                "Pedido #" + event.orderId() + " - " + event.customerName(),
                event.message() + " | Pagado: $" + event.paidAmount() + " / Saldo: $" + event.remainingBalance(),
                event.status() != null ? event.status() : "ACTUALIZADO"
        );
    }
}

package com.example.notificationservice.listener;

import com.example.notificationservice.config.RabbitMQConfig;
import com.example.notificationservice.event.ProductCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ProductNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(ProductNotificationListener.class);

    @RabbitListener(queues = RabbitMQConfig.PRODUCT_NOTIFICATION_QUEUE)
    public void handleProductCreatedNotification(ProductCreatedEvent event) {
        log.info("================ PRODUCT NOTIFICATION RECEIVED (AMQP/RabbitMQ) ================");
        log.info("Product ID:     {}", event.id());
        log.info("Product Name:   {}", event.name());
        log.info("Price:          ${}", event.price());
        log.info("Stock Initial:  {}", event.stock());
        log.info("Timestamp:      {}", event.timestamp());
        log.info("Simulated Notification (Catalog Alert/Inventory Sync) dispatched successfully.");
        log.info("===============================================================================");
    }
}

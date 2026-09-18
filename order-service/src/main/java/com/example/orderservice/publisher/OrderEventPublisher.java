package com.example.orderservice.publisher;

import com.example.orderservice.config.RabbitMQConfig;
import com.example.orderservice.event.OrderNotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public OrderEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishNotification(OrderNotificationEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_EXCHANGE,
                    RabbitMQConfig.ORDER_NOTIFICATION_ROUTING_KEY,
                    event);
            log.info("Published OrderNotificationEvent to RabbitMQ: [orderId={}, status={}]",
                    event.orderId(), event.status());
        } catch (Exception ex) {
            log.warn("Could not publish OrderNotificationEvent for order {}: {}",
                    event.orderId(), ex.getMessage());
        }
    }
}

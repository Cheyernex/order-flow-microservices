package com.example.catalogservice.publisher;

import com.example.catalogservice.config.RabbitMQConfig;
import com.example.catalogservice.event.ProductCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProductEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ProductEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public ProductEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishProductCreated(ProductCreatedEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PRODUCT_EXCHANGE,
                    RabbitMQConfig.PRODUCT_NOTIFICATION_ROUTING_KEY,
                    event);
            log.info("Published ProductCreatedEvent to RabbitMQ: [id={}, name={}, price={}, stock={}]",
                    event.id(), event.name(), event.price(), event.stock());
        } catch (Exception ex) {
            log.warn("Could not publish ProductCreatedEvent for product {}: {}",
                    event.id(), ex.getMessage());
        }
    }
}

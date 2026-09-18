package com.example.paymentservice.publisher;

import com.example.paymentservice.config.RabbitMQConfig;
import com.example.paymentservice.event.PaymentProcessedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public PaymentEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishPaymentProcessed(PaymentProcessedEvent event) {
        try {
            log.info("Publishing PaymentProcessedEvent for orderId: {}, reference: {}, status: {}",
                    event.orderId(), event.reference(), event.status());
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PAYMENT_EXCHANGE,
                    RabbitMQConfig.PAYMENT_NOTIFICATION_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            log.error("Failed to publish PaymentProcessedEvent for reference: {}", event.reference(), e);
        }
    }
}

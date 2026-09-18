package com.example.notificationservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Orders
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ORDER_NOTIFICATION_QUEUE = "order.notification.queue";
    public static final String ORDER_NOTIFICATION_ROUTING_KEY = "order.notification";

    // Products
    public static final String PRODUCT_EXCHANGE = "product.exchange";
    public static final String PRODUCT_NOTIFICATION_QUEUE = "product.notification.queue";
    public static final String PRODUCT_NOTIFICATION_ROUTING_KEY = "product.created";

    // Payments
    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String PAYMENT_NOTIFICATION_QUEUE = "payment.notification.queue";
    public static final String PAYMENT_NOTIFICATION_ROUTING_KEY = "payment.processed";

    // --- Order Beans ---
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public Queue orderNotificationQueue() {
        return new Queue(ORDER_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding orderNotificationBinding(Queue orderNotificationQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderNotificationQueue)
                .to(orderExchange)
                .with(ORDER_NOTIFICATION_ROUTING_KEY);
    }

    // --- Product Beans ---
    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(PRODUCT_EXCHANGE);
    }

    @Bean
    public Queue productNotificationQueue() {
        return new Queue(PRODUCT_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding productNotificationBinding(Queue productNotificationQueue, TopicExchange productExchange) {
        return BindingBuilder.bind(productNotificationQueue)
                .to(productExchange)
                .with(PRODUCT_NOTIFICATION_ROUTING_KEY);
    }

    // --- Payment Beans ---
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    public Queue paymentNotificationQueue() {
        return new Queue(PAYMENT_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding paymentNotificationBinding(Queue paymentNotificationQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentNotificationQueue)
                .to(paymentExchange)
                .with(PAYMENT_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}

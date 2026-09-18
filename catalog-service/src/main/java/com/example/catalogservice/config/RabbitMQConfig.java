package com.example.catalogservice.config;

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

    public static final String PRODUCT_EXCHANGE = "product.exchange";
    public static final String PRODUCT_NOTIFICATION_QUEUE = "product.notification.queue";
    public static final String PRODUCT_NOTIFICATION_ROUTING_KEY = "product.created";

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

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}

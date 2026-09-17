package com.example.orderservice.config;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Resilience4jConfig {

    @Bean
    MeterRegistryCustomizer<MeterRegistry> orderServiceMetricsCustomizer() {
        return registry -> registry.config().commonTags(
                "application", "order-service",
                "resilience", "resilience4j");
    }
}
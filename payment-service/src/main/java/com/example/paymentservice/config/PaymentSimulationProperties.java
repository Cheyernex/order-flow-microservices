package com.example.paymentservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "payment.simulation")
public class PaymentSimulationProperties {

    private double failureRate = 0.30;
    private int minLatencyMs = 200;
    private int maxLatencyMs = 800;

    public double getFailureRate() {
        return failureRate;
    }

    public void setFailureRate(double failureRate) {
        this.failureRate = failureRate;
    }

    public int getMinLatencyMs() {
        return minLatencyMs;
    }

    public void setMinLatencyMs(int minLatencyMs) {
        this.minLatencyMs = minLatencyMs;
    }

    public int getMaxLatencyMs() {
        return maxLatencyMs;
    }

    public void setMaxLatencyMs(int maxLatencyMs) {
        this.maxLatencyMs = maxLatencyMs;
    }
}

package com.example.orderservice.feign;

import com.example.orderservice.dto.PaymentRequest;
import com.example.orderservice.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service")
public interface PaymentClient {

    @PostMapping("/payments/process")
    PaymentResponse processPayment(@RequestBody PaymentRequest request);
}
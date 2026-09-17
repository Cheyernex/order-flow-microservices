package com.example.paymentservice.feign;

import com.example.paymentservice.dto.PaymentConfirmationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service")
public interface OrderClient {

    @PostMapping("/internal/orders/{orderId}/payment-confirmation")
    void confirmPayment(@PathVariable("orderId") Long orderId,
                        @RequestBody PaymentConfirmationRequest request);
}
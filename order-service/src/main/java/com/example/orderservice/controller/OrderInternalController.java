package com.example.orderservice.controller;

import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.PaymentConfirmationRequest;
import com.example.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/orders")
@Tag(name = "Confirmaciones internas", description = "Endpoint interno usado por payment-service")
public class OrderInternalController {

    private final OrderService orderService;

    public OrderInternalController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    @PostMapping("/{id}/payment-confirmation")
    public OrderResponse confirmPayment(@PathVariable Long id,
                                        @Valid @RequestBody PaymentConfirmationRequest request) {
        return orderService.confirmPayment(id, request.reference(), request.amount());
    }
}
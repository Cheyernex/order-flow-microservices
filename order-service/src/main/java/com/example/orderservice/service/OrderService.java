package com.example.orderservice.service;

import com.example.orderservice.dto.OrderRequest;
import com.example.orderservice.dto.OrderResponse;

import java.math.BigDecimal;
import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    OrderResponse getOrder(Long id);

    List<OrderResponse> listOrders();

    OrderResponse confirmPayment(Long id, String reference, BigDecimal amount);
}
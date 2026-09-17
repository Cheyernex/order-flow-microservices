package com.example.orderservice.service;

import com.example.orderservice.dto.NotificationRequest;
import com.example.orderservice.dto.OrderItemRequest;
import com.example.orderservice.dto.OrderRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.PaymentRequest;
import com.example.orderservice.dto.PaymentResponse;
import com.example.orderservice.dto.ProductValidation;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderItem;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.exception.InsufficientStockException;
import com.example.orderservice.exception.OrderNotPayableException;
import com.example.orderservice.exception.ResourceNotFoundException;
import com.example.orderservice.feign.CatalogClient;
import com.example.orderservice.feign.NotificationClient;
import com.example.orderservice.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CatalogClient catalogClient;
    private final PaymentProcessor paymentProcessor;
    private final NotificationClient notificationClient;

    public OrderServiceImpl(OrderRepository orderRepository,
                            CatalogClient catalogClient,
                            PaymentProcessor paymentProcessor,
                            NotificationClient notificationClient) {
        this.orderRepository = orderRepository;
        this.catalogClient = catalogClient;
        this.paymentProcessor = paymentProcessor;
        this.notificationClient = notificationClient;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest item : request.items()) {
            ProductValidation product = catalogClient.getProduct(item.productId());

            if (product == null) {
                throw new ResourceNotFoundException(
                        "Product with id " + item.productId() + " not found");
            }
            if (product.stock() < item.quantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for product '" + product.name()
                                + "' (available: " + product.stock()
                                + ", requested: " + item.quantity() + ")");
            }

            BigDecimal lineTotal = product.price()
                    .multiply(BigDecimal.valueOf(item.quantity()));
            total = total.add(lineTotal);
            items.add(new OrderItem(
                    product.id(), product.name(), product.price(), item.quantity()));
        }

        Order order = new Order(request.customerName(), items);
        order.setTotal(total);
        order = orderRepository.save(order);

        PaymentResponse payment = paymentProcessor.process(
                new PaymentRequest(order.getId(), order.getTotal()));

        if (payment.success()) {
            order.markPaid();
        } else {
            order.markPendingPayment();
            log.warn("Order {} will be left as PAGO_PENDIENTE: {}",
                    order.getId(), payment.message());
        }
        orderRepository.save(order);

        notifyCustomer(order);
        return OrderResponse.from(order);
    }

    @Override
    @Transactional
    public OrderResponse payOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order with id " + id + " not found"));

        if (order.getStatus() != OrderStatus.PAGO_PENDIENTE) {
            throw new OrderNotPayableException(
                    "Order " + id + " cannot be paid because its status is " + order.getStatus());
        }

        PaymentResponse payment = paymentProcessor.process(
                new PaymentRequest(order.getId(), order.getTotal()));

        if (payment.success()) {
            order.markPaid();
        } else {
            log.warn("Payment retry for order {} did not succeed: {}",
                    order.getId(), payment.message());
        }
        orderRepository.save(order);

        notifyCustomer(order);
        return OrderResponse.from(order);
    }

    private void notifyCustomer(Order order) {
        String statusMessage = switch (order.getStatus()) {
            case PAGADO -> "Payment approved. Order confirmed.";
            case PAGO_PENDIENTE -> "Order created but payment is pending.";
            case CREADO -> "Order created.";
        };
        try {
            notificationClient.sendNotification(new NotificationRequest(
                    order.getId(),
                    order.getCustomerName(),
                    order.getStatus().name(),
                    statusMessage));
        } catch (Exception ex) {
            log.warn("Notification could not be sent for order {}: {}",
                    order.getId(), ex.getMessage());
        }
    }
}
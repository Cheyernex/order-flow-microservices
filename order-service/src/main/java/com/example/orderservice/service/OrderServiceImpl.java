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
import com.example.orderservice.exception.InvalidPaymentAmountException;
import com.example.orderservice.exception.OrderNotPayableException;
import com.example.orderservice.exception.ResourceNotFoundException;
import com.example.orderservice.feign.CatalogClient;
import com.example.orderservice.event.OrderNotificationEvent;
import com.example.orderservice.publisher.OrderEventPublisher;
import com.example.orderservice.repository.OrderRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CatalogClient catalogClient;
    private final PaymentProcessor paymentProcessor;
    private final OrderEventPublisher eventPublisher;

    public OrderServiceImpl(OrderRepository orderRepository,
                            CatalogClient catalogClient,
                            PaymentProcessor paymentProcessor,
                            OrderEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.catalogClient = catalogClient;
        this.paymentProcessor = paymentProcessor;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest item : request.items()) {
            ProductValidation product = getProductOrThrow(item.productId());

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
        order.setPaidAmount(BigDecimal.ZERO);
        order.markPendingPayment();
        orderRepository.save(order);

        log.info("Order {} created for customer {} with total ${}. Status: PAGO_PENDIENTE.",
                order.getId(), order.getCustomerName(), total);

        notifyCustomer(order);
        return OrderResponse.from(order);
    }

    @Override
    public OrderResponse getOrder(Long id) {
        return orderRepository.findById(id)
                .map(OrderResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order with id " + id + " not found"));
    }

    @Override
    public List<OrderResponse> listOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Override
    public OrderResponse confirmPayment(Long id, String reference, BigDecimal amount) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order with id " + id + " not found"));

        if (order.getStatus() == OrderStatus.PAGADO) {
            return OrderResponse.from(order);
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidPaymentAmountException("Payment amount must be greater than zero");
        }

        BigDecimal currentPaid = order.getPaidAmount();
        BigDecimal remaining = order.getRemainingBalance();

        if (amount.compareTo(remaining) > 0) {
            throw new InvalidPaymentAmountException(
                    "Payment amount (" + amount + ") exceeds remaining balance (" + remaining + ") for order " + id);
        }

        BigDecimal newPaid = currentPaid.add(amount);
        order.setPaidAmount(newPaid);
        order.setPaymentReference(reference);

        if (newPaid.compareTo(order.getTotal()) >= 0) {
            order.markPaid();
            log.info("Order {} confirmed as PAGADO by payment-service (reference {}, amount {}, total paid {})",
                    order.getId(), reference, amount, newPaid);
        } else {
            order.markPartialPayment();
            log.info("Order {} marked as PAGO_PARCIAL by payment-service (reference {}, amount {}, total paid {}, remaining {})",
                    order.getId(), reference, amount, newPaid, order.getRemainingBalance());
        }

        orderRepository.save(order);
        notifyCustomer(order);
        return OrderResponse.from(order);
    }

    private ProductValidation getProductOrThrow(Long productId) {
        try {
            return catalogClient.getProduct(productId);
        } catch (FeignException.NotFound ex) {
            throw new ResourceNotFoundException("Product with id " + productId + " not found");
        }
    }

    private void notifyCustomer(Order order) {
        String statusMessage = switch (order.getStatus()) {
            case PAGADO -> "Payment approved. Order fully confirmed and paid.";
            case PAGO_PARCIAL -> "Partial payment approved. Remaining balance: " + order.getRemainingBalance();
            case PAGO_PENDIENTE -> "Order created but payment is pending.";
            case CREADO -> "Order created.";
        };
        OrderNotificationEvent event = new OrderNotificationEvent(
                order.getId(),
                order.getCustomerName(),
                order.getStatus().name(),
                statusMessage,
                order.getTotal(),
                order.getPaidAmount(),
                order.getRemainingBalance(),
                Instant.now());
        eventPublisher.publishNotification(event);
    }
}
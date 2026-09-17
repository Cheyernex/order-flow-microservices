package com.example.paymentservice.repository;

import com.example.paymentservice.dto.PaymentStatus;
import com.example.paymentservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByReference(String reference);

    boolean existsByOrderIdAndStatus(Long orderId, PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.id IN (SELECT MAX(p2.id) FROM Payment p2 GROUP BY p2.orderId) ORDER BY p.createdAt DESC")
    List<Payment> findLatestPerOrder();
}

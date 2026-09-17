package com.example.paymentservice.service;

import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;

import java.math.BigDecimal;
import java.util.concurrent.ThreadLocalRandom;

public interface PaymentService {

    PaymentResponse process(PaymentRequest request);
}
package com.example.paymentservice.service;

import com.example.paymentservice.dto.PaymentDetailResponse;
import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse process(PaymentRequest request);

    PaymentDetailResponse findByReference(String reference);

    List<PaymentDetailResponse> findAll();
}

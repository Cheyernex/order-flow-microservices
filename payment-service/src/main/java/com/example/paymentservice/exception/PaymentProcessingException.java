package com.example.paymentservice.exception;

public class PaymentProcessingException extends RuntimeException {

    private final String reference;

    public PaymentProcessingException(String message) {
        this(message, null);
    }

    public PaymentProcessingException(String message, String reference) {
        super(message);
        this.reference = reference;
    }

    public String getReference() {
        return reference;
    }
}

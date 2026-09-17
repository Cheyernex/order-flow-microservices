package com.example.orderservice.exception;

public class OrderNotPayableException extends RuntimeException {

    public OrderNotPayableException(String message) {
        super(message);
    }
}

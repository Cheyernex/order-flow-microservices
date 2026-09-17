package com.example.catalogservice.service;

import com.example.catalogservice.dto.ProductRequest;
import com.example.catalogservice.dto.ProductResponse;

import java.util.List;

public interface ProductService {

    List<ProductResponse> findAll();

    ProductResponse findById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);
}
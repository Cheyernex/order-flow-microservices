package com.example.orderservice.feign;

import com.example.orderservice.dto.ProductValidation;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "catalog-service")
public interface CatalogClient {

    @GetMapping("/api/products/{id}")
    ProductValidation getProduct(@PathVariable("id") Long id);
}
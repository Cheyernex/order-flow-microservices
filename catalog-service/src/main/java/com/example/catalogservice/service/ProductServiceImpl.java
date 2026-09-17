package com.example.catalogservice.service;

import com.example.catalogservice.dto.ProductRequest;
import com.example.catalogservice.dto.ProductResponse;
import com.example.catalogservice.entity.Product;
import com.example.catalogservice.exception.ResourceNotFoundException;
import com.example.catalogservice.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductResponse.from(getProduct(id));
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product(request.name(), request.price(), request.stock());
        return ProductResponse.from(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        product.update(request.name(), request.price(), request.stock());
        return ProductResponse.from(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = getProduct(id);
        productRepository.delete(product);
    }

    private Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product with id " + id + " not found"));
    }
}
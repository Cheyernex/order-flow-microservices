package com.example.catalogservice;

import com.example.catalogservice.entity.Product;
import com.example.catalogservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductRepositoryIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("catalogdb")
                    .withUsername("catalog_user")
                    .withPassword("catalog_pass");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void cleanDb() {
        productRepository.deleteAll();
    }

    @Test
    void shouldPersistProductAndFindById() {
        Product saved = productRepository.save(
                new Product("Laptop", new BigDecimal("1500.00"), 10));

        Optional<Product> found = productRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Laptop");
        assertThat(found.get().getPrice()).isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(found.get().getStock()).isEqualTo(10);
    }

    @Test
    void shouldFindProductByName() {
        productRepository.save(
                new Product("Mouse", new BigDecimal("25.00"), 50));

        Optional<Product> found = productRepository.findByName("Mouse");

        assertThat(found).isPresent();
        assertThat(found.get().getPrice()).isEqualByComparingTo(new BigDecimal("25.00"));
    }

    @Test
    void shouldFindAllProducts() {
        productRepository.save(new Product("A", new BigDecimal("1.00"), 1));
        productRepository.save(new Product("B", new BigDecimal("2.00"), 2));

        List<Product> all = productRepository.findAll();

        assertThat(all).hasSize(2);
    }

    @Test
    void shouldDeleteProduct() {
        Product saved = productRepository.save(
                new Product("Keyboard", new BigDecimal("40.00"), 20));

        productRepository.delete(saved);

        assertThat(productRepository.findById(saved.getId())).isEmpty();
    }
}
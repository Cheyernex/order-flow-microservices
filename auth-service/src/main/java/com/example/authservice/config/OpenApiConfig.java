package com.example.authservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI authOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Auth & User Management Service API")
                        .description("Microservicio de autenticación, JWT y gestión de empleados")
                        .version("1.0.0")
                        .contact(new Contact().name("Cheyernex Manzanillo").url("https://github.com/Cheyernex")));
    }
}

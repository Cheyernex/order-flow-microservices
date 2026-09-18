package com.example.authservice.config;

import com.example.authservice.entity.Role;
import com.example.authservice.entity.User;
import com.example.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                log.info("Seeding initial users into auth-service PostgreSQL database...");

                User admin = new User(
                        "admin",
                        passwordEncoder.encode("admin"),
                        "Cheyernex Manzanillo",
                        "cheyernex@gmail.com",
                        "Tecnología / DevOps",
                        Role.ADMIN
                );

                userRepository.save(admin);
                log.info("Default admin user created: admin (cheyernex@gmail.com)");
            }
        };
    }
}

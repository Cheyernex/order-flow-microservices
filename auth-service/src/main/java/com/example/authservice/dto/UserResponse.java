package com.example.authservice.dto;

import com.example.authservice.entity.Role;
import com.example.authservice.entity.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String department,
        Role role,
        boolean active,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getDepartment(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}

package com.example.authservice.dto;

import com.example.authservice.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRequest(
        @NotBlank(message = "El nombre completo es requerido")
        String fullName,

        @NotBlank(message = "El correo electrónico es requerido")
        @Email(message = "Formato de correo inválido")
        String email,

        String department,

        @NotNull(message = "El rol es requerido")
        Role role,

        Boolean active,

        String password
) {}

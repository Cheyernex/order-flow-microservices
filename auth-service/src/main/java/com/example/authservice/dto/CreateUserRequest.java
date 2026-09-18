package com.example.authservice.dto;

import com.example.authservice.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "El usuario es requerido")
        @Size(min = 3, max = 50)
        String username,

        @NotBlank(message = "La contraseña es requerida")
        @Size(min = 4)
        String password,

        @NotBlank(message = "El nombre completo es requerido")
        String fullName,

        @NotBlank(message = "El correo es requerido")
        @Email
        String email,

        String department,

        Role role
) {
}

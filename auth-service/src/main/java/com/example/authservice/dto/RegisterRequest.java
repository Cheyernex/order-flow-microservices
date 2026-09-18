package com.example.authservice.dto;

import com.example.authservice.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El usuario es requerido")
        @Size(min = 3, max = 50, message = "El usuario debe tener entre 3 y 50 caracteres")
        String username,

        @NotBlank(message = "La contraseña es requerida")
        @Size(min = 4, message = "La contraseña debe tener al menos 4 caracteres")
        String password,

        @NotBlank(message = "El nombre completo es requerido")
        String fullName,

        @NotBlank(message = "El correo es requerido")
        @Email(message = "El correo debe tener un formato válido")
        String email,

        String department,

        Role role
) {
}

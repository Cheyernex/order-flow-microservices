package com.example.authservice.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El nombre de usuario es requerido")
        String username,

        @NotBlank(message = "La contraseña es requerida")
        String password
) {
}

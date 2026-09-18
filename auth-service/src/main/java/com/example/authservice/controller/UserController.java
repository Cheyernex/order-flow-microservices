package com.example.authservice.controller;

import com.example.authservice.dto.CreateUserRequest;
import com.example.authservice.dto.UserResponse;
import com.example.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth/users")
@Tag(name = "Usuarios & Empleados", description = "Gestión integral de usuarios y empleados del sistema")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Listar todos los usuarios y empleados registrados")
    public ResponseEntity<List<UserResponse>> listUsers() {
        return ResponseEntity.ok(authService.listUsers());
    }

    @GetMapping("/{username}")
    @Operation(summary = "Obtener detalles de un usuario por su username")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        return ResponseEntity.ok(authService.getUser(username));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo usuario / empleado con rol")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse created = authService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{username}")
    @Operation(summary = "Actualizar usuario / empleado por username")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String username,
                                                   @Valid @RequestBody com.example.authservice.dto.UpdateUserRequest request) {
        UserResponse updated = authService.updateUser(username, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{username}")
    @Operation(summary = "Eliminar usuario / empleado por username")
    public ResponseEntity<Void> deleteUser(@PathVariable String username) {
        authService.deleteUser(username);
        return ResponseEntity.noContent().build();
    }
}

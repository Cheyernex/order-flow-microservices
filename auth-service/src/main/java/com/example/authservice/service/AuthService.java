package com.example.authservice.service;

import com.example.authservice.dto.CreateUserRequest;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.LoginResponse;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.dto.UserResponse;

import java.util.List;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    UserResponse register(RegisterRequest request);
    List<UserResponse> listUsers();
    UserResponse getUser(String username);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(String username, com.example.authservice.dto.UpdateUserRequest request);
    void deleteUser(String username);
}

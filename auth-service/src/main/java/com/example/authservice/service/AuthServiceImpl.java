package com.example.authservice.service;

import com.example.authservice.dto.CreateUserRequest;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.LoginResponse;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.dto.UserResponse;
import com.example.authservice.entity.Role;
import com.example.authservice.entity.User;
import com.example.authservice.exception.InvalidCredentialsException;
import com.example.authservice.exception.ResourceNotFoundException;
import com.example.authservice.exception.UserAlreadyExistsException;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String username = request.username().trim().toLowerCase();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Credenciales inválidas"));

        if (!user.isActive()) {
            throw new InvalidCredentialsException("La cuenta de usuario se encuentra inactiva");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Credenciales inválidas");
        }

        String token = jwtUtils.generateToken(
                user.getUsername(),
                user.getRole().name(),
                user.getEmail(),
                user.getFullName()
        );

        log.info("User {} successfully authenticated with role {}", user.getUsername(), user.getRole());
        return LoginResponse.of(token, UserResponse.from(user));
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String username = request.username().trim().toLowerCase();
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("El nombre de usuario ya está registrado");
        }

        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new UserAlreadyExistsException("El correo electrónico ya está registrado");
        }

        User user = new User(
                username,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.email().trim().toLowerCase(),
                request.department() != null ? request.department().trim() : "General",
                request.role() != null ? request.role() : Role.OPERATOR
        );

        userRepository.save(user);
        log.info("New user registered: {} [{}]", user.getUsername(), user.getRole());
        return UserResponse.from(user);
    }

    @Override
    public List<UserResponse> listUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    public UserResponse getUser(String username) {
        return userRepository.findByUsername(username.trim().toLowerCase())
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String username = request.username().trim().toLowerCase();
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("El usuario ya existe");
        }

        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new UserAlreadyExistsException("El correo ya existe");
        }

        User user = new User(
                username,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.email().trim().toLowerCase(),
                request.department() != null ? request.department().trim() : "Operaciones",
                request.role() != null ? request.role() : Role.OPERATOR
        );

        userRepository.save(user);
        log.info("Admin created new employee user: {}", user.getUsername());
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(String username, com.example.authservice.dto.UpdateUserRequest request) {
        User user = userRepository.findByUsername(username.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        String newEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new UserAlreadyExistsException("El correo ya está en uso por otro usuario");
        }

        user.setFullName(request.fullName().trim());
        user.setEmail(newEmail);
        if (request.department() != null) {
            user.setDepartment(request.department().trim());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.active() != null) {
            user.setActive(request.active());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        userRepository.save(user);
        log.info("User {} updated successfully", username);
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));
        userRepository.delete(user);
        log.info("User {} deleted", username);
    }
}

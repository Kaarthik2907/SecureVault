package com.securevault.service;

import com.securevault.dto.LoginRequest;
import com.securevault.dto.LoginResponse;
import com.securevault.entity.User;
import com.securevault.repository.UserRepository;
import com.securevault.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtUtil);
    }

    @Test
    @DisplayName("Should successfully login user with correct credentials")
    void testLoginSuccess() {
        User user = new User(101L, "EMP-0101", "johndoe", "$2a$10$hash", "John Doe",
                "johndoe@securevault.internal", "OFFICER", 1L, true);

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("SecurePassword123!", "$2a$10$hash")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("mocked.jwt.token");

        LoginRequest request = new LoginRequest("johndoe", "SecurePassword123!");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.token());
        assertEquals("johndoe", response.username());
        assertEquals("OFFICER", response.role());
        assertEquals(101L, response.employeeId());
        assertEquals(1L, response.branchId());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when username does not exist")
    void testLoginUserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("nonexistent", "SomePassword!");

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password does not match")
    void testLoginWrongPassword() {
        User user = new User(101L, "EMP-0101", "johndoe", "$2a$10$hash", "John Doe",
                "johndoe@securevault.internal", "OFFICER", 1L, true);

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "$2a$10$hash")).thenReturn(false);

        LoginRequest request = new LoginRequest("johndoe", "WrongPassword");

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should throw DisabledException when user account is inactive")
    void testLoginDisabledAccount() {
        User user = new User(101L, "EMP-0101", "johndoe", "$2a$10$hash", "John Doe",
                "johndoe@securevault.internal", "OFFICER", 1L, false);

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest("johndoe", "SecurePassword123!");

        assertThrows(DisabledException.class, () -> authService.login(request));
    }
}

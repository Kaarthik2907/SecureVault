package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Immutable request DTO for employee authentication.
 *
 * @param username The employee's unique username.
 * @param password The employee's plain-text password for credential verification.
 */
public record LoginRequest(
    @NotBlank(message = "Username is required")
    String username,

    @NotBlank(message = "Password is required")
    String password
) {}

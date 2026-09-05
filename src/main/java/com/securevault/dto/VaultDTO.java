package com.securevault.dto;

import com.securevault.entity.VaultStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Immutable DTO representing a high-security vault.
 *
 * @param id Unique identifier of the vault.
 * @param vaultCode Unique code for the vault (e.g., VLT-MUM-A1).
 * @param branchId Identifier of the branch housing the vault.
 * @param name Descriptive name of the vault.
 * @param securityLevel Security classification level (e.g., HIGH, CRITICAL).
 * @param maxConcurrentAccess Maximum concurrent access permits allowed.
 * @param status Operational status of the vault (LOCKED, UNLOCKED, MAINTENANCE).
 * @param isLocked Flag indicating whether the vault is locked.
 */
public record VaultDTO(
    Long id,
    @NotBlank(message = "Vault code is required")
    String vaultCode,
    @NotNull(message = "Branch ID is required")
    Long branchId,
    @NotBlank(message = "Vault name is required")
    String name,
    String securityLevel,
    Integer maxConcurrentAccess,
    VaultStatus status,
    boolean isLocked
) {}

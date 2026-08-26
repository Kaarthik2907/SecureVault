package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Immutable request DTO for creating a vault access request.
 *
 * @param vaultId The ID of the target vault to access.
 * @param reason Detailed justification for accessing the vault.
 * @param estimatedDurationMinutes The requested access window duration in minutes.
 */
public record VaultRequestDTO(
    @NotNull(message = "Vault ID is required")
    Long vaultId,

    @NotBlank(message = "Reason is required")
    String reason,

    @NotNull(message = "Estimated duration is required")
    @Positive(message = "Estimated duration must be greater than 0")
    Integer estimatedDurationMinutes
) {}

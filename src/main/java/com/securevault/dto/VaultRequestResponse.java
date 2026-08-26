package com.securevault.dto;

import java.time.LocalDateTime;

/**
 * Immutable response DTO representing the submitted or queried vault access request.
 *
 * @param requestId Unique identifier for the vault access request.
 * @param vaultId Identifier of the requested vault.
 * @param requestedById Identifier of the employee who submitted the request.
 * @param status Current status of the request (e.g., PENDING, APPROVED, REJECTED, EXPIRED).
 * @param requestedAt Timestamp when the request was registered.
 */
public record VaultRequestResponse(
    Long requestId,
    Long vaultId,
    Long requestedById,
    String status,
    LocalDateTime requestedAt
) {}

package com.securevault.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Immutable response DTO representing the submitted or queried vault access request.
 *
 * @param requestId Unique identifier for the vault access request.
 * @param vaultId Identifier of the requested vault.
 * @param requestedById Identifier of the employee who submitted the request.
 * @param status Current status of the request (e.g., PENDING, APPROVED, REJECTED, EXPIRED).
 * @param requestedAt Timestamp when the request was registered.
 * @param reason Detailed justification for accessing the vault.
 * @param estimatedDurationMinutes Access window duration in minutes.
 * @param authorizationCode Cryptographic authorization code if approved.
 * @param approvedById Identifier of the approving manager.
 * @param remarks Comments recorded by manager upon decision.
 * @param approvedAt Timestamp when approved/rejected.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VaultRequestResponse(
    Long requestId,
    Long vaultId,
    Long requestedById,
    String status,
    LocalDateTime requestedAt,
    String reason,
    Integer estimatedDurationMinutes,
    String authorizationCode,
    Long approvedById,
    String remarks,
    LocalDateTime approvedAt
) {
    public VaultRequestResponse(
            Long requestId,
            Long vaultId,
            Long requestedById,
            String status,
            LocalDateTime requestedAt) {
        this(requestId, vaultId, requestedById, status, requestedAt, null, null, null, null, null, null);
    }
}

package com.securevault.dto;

/**
 * Immutable response DTO returned following an approval or rejection decision.
 *
 * @param requestId Identifier of the evaluated access request.
 * @param status Updated status of the request (APPROVED or REJECTED).
 * @param approvedById Identifier of the manager who made the approval decision.
 * @param authorizationCode Secure cryptographic authorization code (provided upon approval; null if rejected).
 */
public record ApprovalDecisionResponse(
    Long requestId,
    String status,
    Long approvedById,
    String authorizationCode
) {}

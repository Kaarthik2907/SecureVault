package com.securevault.dto;

/**
 * Immutable response DTO containing authentication results and session token.
 *
 * @param token The signed JWT token for subsequent API requests.
 * @param username The authenticated username.
 * @param role The role assigned to the employee (e.g., OFFICER, BRANCH_MANAGER, AUDITOR).
 * @param employeeId The primary identifier of the authenticated employee.
 * @param branchId The branch identifier to which the employee is assigned.
 */
public record LoginResponse(
    String token,
    String username,
    String role,
    Long employeeId,
    Long branchId
) {}

package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Immutable request DTO for approving or rejecting a vault access request.
 *
 * @param action Decision action, must be either APPROVE or REJECT.
 * @param remarks Optional or mandatory comments explaining the manager's decision.
 */
public record ApprovalDecisionRequest(
    @NotBlank(message = "Action is required")
    @Pattern(regexp = "^(APPROVE|REJECT)$", message = "Action must be either 'APPROVE' or 'REJECT'")
    String action,

    String remarks
) {}

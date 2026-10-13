package com.securevault.dto;

import com.securevault.entity.AuditLog;

/**
 * Response DTO returned when a vault access request is executed and the vault is unlocked.
 */
public record VaultExecuteResponse(
        boolean success,
        String message,
        Long vaultId,
        AuditLog auditLog
) {}

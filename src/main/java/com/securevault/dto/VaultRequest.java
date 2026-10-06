package com.securevault.dto;

public record VaultRequest(
        String vaultCode,
        Long branchId,
        String name,
        String securityLevel,
        Integer maxConcurrentAccess,
        Boolean isLocked
) {
}
package com.securevault.util;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class HashChainUtilTest {

    @Test
    @DisplayName("Should generate the same SHA-256 hash for the same input")
    void shouldGenerateDeterministicSha256Hash() {
        String input = "SecureVault";

        String firstHash = HashChainUtil.sha256(input);
        String secondHash = HashChainUtil.sha256(input);

        assertEquals(firstHash, secondHash);
        assertEquals(64, firstHash.length());
    }

    @Test
    @DisplayName("Should generate different SHA-256 hashes for different inputs")
    void shouldGenerateDifferentHashesForDifferentInputs() {
        String firstHash = HashChainUtil.sha256("SecureVault");
        String secondHash = HashChainUtil.sha256("SecureVault!");

        assertNotEquals(firstHash, secondHash);
    }

    @Test
    @DisplayName("Should generate the same hash-chain hash for identical audit data")
    void shouldGenerateDeterministicHashChainHash() {
        String previousHash =
                "0000000000000000000000000000000000000000000000000000000000000000";

        String logId = "LOG-20260826-0001";
        String eventType = "SYSTEM_INITIALIZATION";
        Long employeeId = 102L;
        Long vaultId = null;
        String actionDetails =
                "SecureVault core schema and cryptographic audit chain initialized.";
        String timestamp = "2026-08-26 09:00:00";

        String firstHash = HashChainUtil.calculateHash(
                previousHash,
                logId,
                eventType,
                employeeId,
                vaultId,
                actionDetails,
                timestamp
        );

        String secondHash = HashChainUtil.calculateHash(
                previousHash,
                logId,
                eventType,
                employeeId,
                vaultId,
                actionDetails,
                timestamp
        );

        assertEquals(firstHash, secondHash);
        assertEquals(64, firstHash.length());
    }
}
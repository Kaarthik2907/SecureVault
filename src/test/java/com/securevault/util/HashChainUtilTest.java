package com.securevault.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HashChainUtilTest {

    @Test
    @DisplayName("Should generate deterministic SHA-256 hash")
    void testSha256() {
        String hash = HashChainUtil.sha256("test");
        assertNotNull(hash);
        assertEquals(64, hash.length());
        assertEquals("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", hash);
    }

    @Test
    @DisplayName("Should calculate hash chain accurately")
    void testCalculateHash() {
        String prevHash = "0000000000000000000000000000000000000000000000000000000000000000";
        String logId = "LOG-20260826-0001";
        String eventType = "SYSTEM_INITIALIZATION";
        Long employeeId = 102L;
        Long vaultId = null;
        String actionDetails = "SecureVault core schema and cryptographic audit chain initialized.";
        String timestamp = "2026-08-26 09:00:00";

        String hash = HashChainUtil.calculateHash(prevHash, logId, eventType, employeeId, vaultId, actionDetails, timestamp);
        assertNotNull(hash);
        assertEquals(64, hash.length());
    }
}

package com.securevault.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility class for SHA-256 hash chaining used by SecureVault audit logs.
 */
public final class HashChainUtil {

    private HashChainUtil() {
        // Prevent instantiation
    }

    /**
     * Calculates the SHA-256 hash for an audit log entry.
     *
     * The hash is based on:
     * previousHash + logId + eventType + employeeId +
     * vaultId + actionDetails + timestamp
     */
    public static String calculateHash(
            String previousHash,
            String logId,
            String eventType,
            Long employeeId,
            Long vaultId,
            String actionDetails,
            String timestamp) {

        String data =
                safe(previousHash)
                + safe(logId)
                + safe(eventType)
                + String.valueOf(employeeId)
                + safe(String.valueOf(vaultId))
                + safe(actionDetails)
                + safe(timestamp);

        return sha256(data);
    }

    /**
     * Computes SHA-256 and returns the result as a
     * lowercase hexadecimal string.
     */
    public static String sha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hashBytes =
                    digest.digest(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder(64);

            for (byte b : hashBytes) {
                hex.append(String.format("%02x", b));
            }

            return hex.toString();

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is not available",
                    e
            );
        }
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}
package com.securevault.dto;

import java.time.LocalDateTime;

/**
 * Immutable response DTO detailing the cryptographic audit hash chain verification outcome.
 *
 * @param isChainValid Indicates whether the cryptographic SHA-256 hash chain is intact and uncorrupted.
 * @param totalRecordsChecked Total count of audit log records processed during verification.
 * @param tamperedLogId Identifier of the first corrupted record detected, or null if the chain is valid.
 * @param expectedHash Recomputed expected cryptographic SHA-256 hash at the point of corruption, or null if valid.
 * @param actualHash The recorded hash found in the corrupted record, or null if valid.
 * @param verifiedAt Timestamp when the audit verification was performed.
 */
public record AuditVerificationResponse(
    boolean isChainValid,
    long totalRecordsChecked,
    Long tamperedLogId,
    String expectedHash,
    String actualHash,
    LocalDateTime verifiedAt
) {}

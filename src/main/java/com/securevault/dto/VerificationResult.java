package com.securevault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * Immutable DTO detailing the cryptographic audit hash chain verification outcome.
 */
public record VerificationResult(
        @JsonProperty("isValid")
        boolean isValid,

        @JsonProperty("message")
        String message,

        @JsonProperty("tamperedLogId")
        String failingLogId,

        @JsonProperty("totalRecordsChecked")
        long totalRecordsChecked,

        @JsonProperty("expectedHash")
        String expectedHash,

        @JsonProperty("actualHash")
        String actualHash,

        @JsonProperty("verifiedAt")
        LocalDateTime verifiedAt
) {
    public VerificationResult(boolean isValid, String message, String failingLogId) {
        this(isValid, message, failingLogId, 0L, null, null, LocalDateTime.now());
    }

    @JsonProperty("isChainValid")
    public boolean isChainValid() {
        return isValid;
    }

    @JsonProperty("failingLogId")
    public String failingLogIdProperty() {
        return failingLogId;
    }

    @JsonProperty("logId")
    public String logIdProperty() {
        return failingLogId;
    }
}

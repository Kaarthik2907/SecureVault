package com.securevault.service;

import com.securevault.entity.AuditLog;
import com.securevault.repository.AuditLogRepository;
import com.securevault.util.HashChainUtil;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for creating and verifying cryptographically chained audit logs.
 */
@Service
public class AuditLogService {

    private static final String GENESIS_HASH =
            "0000000000000000000000000000000000000000000000000000000000000000";

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * DTO for returning the result of a chain verification.
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

    /**
     * Creates a new audit log as part of the existing hash chain.
     *
     * The entire operation runs inside one transaction:
     *
     * 1. Lock the latest audit row.
     * 2. Read its current hash.
     * 3. Create the new log.
     * 4. Calculate the new SHA-256 hash.
     * 5. Save the new audit row.
     * 6. Commit everything together.
     */
    @Transactional
    public AuditLog createAuditLog(
            String logId,
            String eventType,
            Long employeeId,
            Long vaultId,
            String actionDetails) {

        /*
         * Lock the latest row before reading its hash.
         * This prevents two concurrent transactions from using
         * the same previous_hash.
         */
        AuditLog latestLog =
                auditLogRepository.findLatestForUpdate()
                        .orElse(null);

        String previousHash =
                latestLog == null
                        ? GENESIS_HASH
                        : latestLog.getCurrentHash();

        LocalDateTime timestamp = LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);

        /*
         * Convert timestamp to a deterministic string representation.
         */
        String timestampValue = timestamp.toString();

        /*
         * Calculate the current hash from the complete audit record.
         */
        String currentHash = HashChainUtil.calculateHash(
                previousHash,
                logId,
                eventType,
                employeeId,
                vaultId,
                actionDetails,
                timestampValue
        );

        /*
         * Create the new audit log.
         */
        AuditLog auditLog = new AuditLog();

        auditLog.setLogId(logId);
        auditLog.setEventType(eventType);
        auditLog.setEmployeeId(employeeId);
        auditLog.setVaultId(vaultId);
        auditLog.setActionDetails(actionDetails);
        auditLog.setTimestamp(timestamp);
        auditLog.setPreviousHash(previousHash);
        auditLog.setCurrentHash(currentHash);

        /*
         * Because this method is @Transactional, this INSERT and
         * the previous SELECT ... FOR UPDATE are part of the same
         * database transaction.
         */
        return auditLogRepository.save(auditLog);
    }

    /**
     * Verifies the integrity of the entire audit log hash chain.
     * Recomputes hashes and checks links sequentially from oldest to newest.
     */
    @Transactional(readOnly = true)
    public VerificationResult verifyChain() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByIdAsc();
        String expectedPreviousHash = GENESIS_HASH;

        for (int i = 0; i < logs.size(); i++) {
            AuditLog log = logs.get(i);
            String logIdentifier = log.getLogId() != null ? log.getLogId() : (log.getId() != null ? String.valueOf(log.getId()) : "UNKNOWN");

            // 1. Verify the link to the previous record
            if (!expectedPreviousHash.equals(log.getPreviousHash())) {
                return new VerificationResult(
                        false, 
                        "Broken chain link: previous_hash does not match the prior current_hash.", 
                        logIdentifier,
                        i,
                        expectedPreviousHash,
                        log.getPreviousHash(),
                        LocalDateTime.now()
                );
            }

            // 2. Recompute the hash using exact same canonical formatting as the writer
            String recomputedHash = HashChainUtil.calculateHash(
                    log.getPreviousHash(),
                    log.getLogId(),
                    log.getEventType(),
                    log.getEmployeeId(),
                    log.getVaultId(),
                    log.getActionDetails(),
                    log.getTimestamp() != null ? log.getTimestamp().toString() : ""
            );

            // 3. Verify the recomputed hash matches the stored hash
            if (!recomputedHash.equals(log.getCurrentHash())) {
                return new VerificationResult(
                        false, 
                        "Data tampered: recomputed hash does not match stored current_hash.", 
                        logIdentifier,
                        i,
                        recomputedHash,
                        log.getCurrentHash(),
                        LocalDateTime.now()
                );
            }

            // 4. Update the expected previous hash for the next iteration
            expectedPreviousHash = log.getCurrentHash();
        }

        return new VerificationResult(true, "Chain is fully valid.", null, logs.size(), null, null, LocalDateTime.now());
    }

    /**
     * Restores cryptographic integrity across the entire audit log chain.
     * Cleans any simulation tampering text and recalculates valid SHA-256 forward links.
     */
    @Transactional
    public void resetChain() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByIdAsc();
        String expectedPreviousHash = GENESIS_HASH;

        for (AuditLog log : logs) {
            if (log.getActionDetails() != null && log.getActionDetails().contains("[MALICIOUS")) {
                log.setActionDetails(log.getActionDetails().replaceAll("\\[MALICIOUS[^\\]]*\\]", "").trim());
            }
            log.setPreviousHash(expectedPreviousHash);
            String validHash = HashChainUtil.calculateHash(
                    expectedPreviousHash,
                    log.getLogId(),
                    log.getEventType(),
                    log.getEmployeeId(),
                    log.getVaultId(),
                    log.getActionDetails(),
                    log.getTimestamp() != null ? log.getTimestamp().toString() : ""
            );
            log.setCurrentHash(validHash);
            auditLogRepository.save(log);
            expectedPreviousHash = validHash;
        }
    }

    /**
     * Simulates malicious tampering on a specific or latest audit log record for security demonstration.
     */
    @Transactional
    public AuditLog simulateTamper(Object targetLogId) {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByIdAsc();
        if (logs.isEmpty()) {
            throw new IllegalStateException("No audit logs available to tamper.");
        }

        AuditLog target = null;
        if (targetLogId != null) {
            String targetStr = String.valueOf(targetLogId);
            try {
                Long numericId = Long.parseLong(targetStr);
                target = auditLogRepository.findById(numericId).orElse(null);
            } catch (NumberFormatException ignored) {}

            if (target == null) {
                for (AuditLog l : logs) {
                    if (targetStr.equals(l.getLogId())) {
                        target = l;
                        break;
                    }
                }
            }
        }

        if (target == null) {
            target = logs.get(logs.size() - 1);
        }

        target.setActionDetails(target.getActionDetails() + " [MALICIOUS UNAUTHORIZED MODIFICATION]");
        return auditLogRepository.save(target);
    }

    /**
     * Retrieves historical audit log records matching the specified filters with pagination.
     * Defaults to descending timestamp order if unsorted.
     *
     * @param vaultId   Optional vault ID filter.
     * @param startDate Optional start of timestamp range (inclusive).
     * @param endDate   Optional end of timestamp range (inclusive).
     * @param pageable  Pagination and sorting parameters.
     * @return A page of AuditLog entries.
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getHistoricalLogs(
            Long vaultId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "timestamp")
            );
        }
        return auditLogRepository.findFiltered(vaultId, startDate, endDate, pageable);
    }

    /**
     * Retrieves historical audit log records matching the specified filters as an unpaged list,
     * ordered by timestamp descending.
     *
     * @param vaultId   Optional vault ID filter.
     * @param startDate Optional start of timestamp range (inclusive).
     * @param endDate   Optional end of timestamp range (inclusive).
     * @return A list of AuditLog entries.
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getHistoricalLogs(
            Long vaultId,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return auditLogRepository.findFilteredList(vaultId, startDate, endDate);
    }

    /**
     * Retrieves historical audit logs for a specific vault with pagination.
     *
     * @param vaultId  The vault ID.
     * @param pageable Pagination and sorting parameters.
     * @return A page of AuditLog entries for the vault.
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByVaultId(Long vaultId, Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "timestamp")
            );
        }
        return auditLogRepository.findByVaultId(vaultId, pageable);
    }
}
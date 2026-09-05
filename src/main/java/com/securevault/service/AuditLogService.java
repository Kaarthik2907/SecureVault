package com.securevault.service;

import com.securevault.entity.AuditLog;
import com.securevault.repository.AuditLogRepository;
import com.securevault.util.HashChainUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service responsible for creating cryptographically chained audit logs.
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

        LocalDateTime timestamp = LocalDateTime.now();

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
}
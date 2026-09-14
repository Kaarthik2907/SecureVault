package com.securevault.repository;

import com.securevault.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

/**
 * Repository for SecureVault audit log operations.
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Finds the most recent audit log and locks it for writing.
     *
     * PESSIMISTIC_WRITE prevents concurrent transactions from
     * reading the same latest hash and creating a fork in the chain.
     */
    @Query(
    value = """
        SELECT *
        FROM audit_logs
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE
        """,
    nativeQuery = true
)
Optional<AuditLog> findLatestForUpdate();
    /**
     * Returns all audit logs in chronological/id order.
     * Used later by the chain verification logic.
     */
    List<AuditLog> findAllByOrderByIdAsc();
}
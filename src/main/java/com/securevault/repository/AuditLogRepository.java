package com.securevault.repository;

import com.securevault.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

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
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT a
            FROM AuditLog a
            WHERE a.id = (
                SELECT MAX(a2.id)
                FROM AuditLog a2
            )
            """)
    Optional<AuditLog> findLatestForUpdate();

    /**
     * Returns all audit logs in chronological/id order.
     * Used later by the chain verification logic.
     */
    List<AuditLog> findAllByOrderByIdAsc();
}
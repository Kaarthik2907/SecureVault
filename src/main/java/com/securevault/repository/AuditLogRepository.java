package com.securevault.repository;

import com.securevault.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    /**
     * Finds audit logs filtered by vault ID and/or timestamp date range with pagination.
     * Evaluates null filters dynamically to support any combination of criteria.
     */
    @Query(
        value = """
            SELECT a FROM AuditLog a
            WHERE (:vaultId IS NULL OR a.vaultId = :vaultId)
              AND (:startDate IS NULL OR a.timestamp >= :startDate)
              AND (:endDate IS NULL OR a.timestamp <= :endDate)
        """,
        countQuery = """
            SELECT count(a) FROM AuditLog a
            WHERE (:vaultId IS NULL OR a.vaultId = :vaultId)
              AND (:startDate IS NULL OR a.timestamp >= :startDate)
              AND (:endDate IS NULL OR a.timestamp <= :endDate)
        """
    )
    Page<AuditLog> findFiltered(
            @Param("vaultId") Long vaultId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Finds audit logs filtered by vault ID and/or timestamp date range as an unpaged list,
     * ordered by timestamp descending.
     */
    @Query("""
        SELECT a FROM AuditLog a
        WHERE (:vaultId IS NULL OR a.vaultId = :vaultId)
          AND (:startDate IS NULL OR a.timestamp >= :startDate)
          AND (:endDate IS NULL OR a.timestamp <= :endDate)
        ORDER BY a.timestamp DESC
    """)
    List<AuditLog> findFilteredList(
            @Param("vaultId") Long vaultId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Finds audit logs for a specific vault ordered with pagination.
     */
    Page<AuditLog> findByVaultId(Long vaultId, Pageable pageable);

    /**
     * Finds audit logs within a timestamp range with pagination.
     */
    Page<AuditLog> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Finds audit logs for a specific vault within a timestamp range with pagination.
     */
    Page<AuditLog> findByVaultIdAndTimestampBetween(Long vaultId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
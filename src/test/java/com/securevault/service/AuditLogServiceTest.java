package com.securevault.service;

import com.securevault.entity.AuditLog;
import com.securevault.repository.AuditLogRepository;
import com.securevault.util.HashChainUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    private AuditLog log1;
    private AuditLog log2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        String genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";
        // Fixed timestamp for deterministic testing
        LocalDateTime fixedTime = LocalDateTime.of(2026, 10, 12, 10, 0);

        // Record 1: Valid initial entry
        log1 = new AuditLog();
        log1.setLogId("LOG-001");
        log1.setEventType("VAULT_OPEN");
        log1.setEmployeeId(101L);
        log1.setVaultId(1L);
        log1.setActionDetails("Opened for daily cash drop");
        log1.setTimestamp(fixedTime);
        log1.setPreviousHash(genesisHash);
        log1.setCurrentHash(HashChainUtil.calculateHash(
                genesisHash, "LOG-001", "VAULT_OPEN", 101L, 1L, "Opened for daily cash drop", fixedTime.toString()
        ));

        // Record 2: Valid chained entry
        log2 = new AuditLog();
        log2.setLogId("LOG-002");
        log2.setEventType("VAULT_CLOSE");
        log2.setEmployeeId(101L);
        log2.setVaultId(1L);
        log2.setActionDetails("Closed after cash drop");
        log2.setTimestamp(fixedTime.plusMinutes(5));
        log2.setPreviousHash(log1.getCurrentHash());
        log2.setCurrentHash(HashChainUtil.calculateHash(
                log1.getCurrentHash(), "LOG-002", "VAULT_CLOSE", 101L, 1L, "Closed after cash drop", fixedTime.plusMinutes(5).toString()
        ));
    }

    @Test
    @DisplayName("Should return valid for an untampered hash chain")
    void shouldVerifyValidChain() {
        when(auditLogRepository.findAllByOrderByIdAsc()).thenReturn(List.of(log1, log2));
        AuditLogService.VerificationResult result = auditLogService.verifyChain();
        
        assertTrue(result.isValid(), "Chain should be valid");
    }

    @Test
    @DisplayName("Should detect tampered data in an audit log")
    void shouldDetectTamperedData() {
        // Simulate a malicious SQL edit to a historical field
        log1.setActionDetails("Tampered: altered action details");
        when(auditLogRepository.findAllByOrderByIdAsc()).thenReturn(List.of(log1, log2));
        
        AuditLogService.VerificationResult result = auditLogService.verifyChain();
        
        assertFalse(result.isValid());
        assertEquals("LOG-001", result.failingLogId());
        assertTrue(result.message().contains("recomputed hash does not match"));
    }

    @Test
    @DisplayName("Should detect a broken previous_hash link")
    void shouldDetectBrokenLink() {
        // Simulate an orphaned record or manually changed previous_hash
        log2.setPreviousHash("invalid_hash_value");
        when(auditLogRepository.findAllByOrderByIdAsc()).thenReturn(List.of(log1, log2));
        
        AuditLogService.VerificationResult result = auditLogService.verifyChain();
        
        assertFalse(result.isValid());
        assertEquals("LOG-002", result.failingLogId());
        assertTrue(result.message().contains("previous_hash does not match"));
    }

    @Test
    @DisplayName("Should fetch historical logs with pagination and default sort")
    void shouldFetchHistoricalLogsPaged() {
        Page<AuditLog> page = new PageImpl<>(List.of(log1, log2), PageRequest.of(0, 10), 2);
        when(auditLogRepository.findFiltered(eq(1L), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        Page<AuditLog> result = auditLogService.getHistoricalLogs(1L, null, null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals("LOG-001", result.getContent().get(0).getLogId());
    }

    @Test
    @DisplayName("Should fetch historical logs as unpaged list")
    void shouldFetchHistoricalLogsList() {
        when(auditLogRepository.findFilteredList(eq(1L), any(), any()))
                .thenReturn(List.of(log1, log2));

        List<AuditLog> result = auditLogService.getHistoricalLogs(1L, null, null);

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should fetch logs by vault ID")
    void shouldFetchLogsByVaultId() {
        Page<AuditLog> page = new PageImpl<>(List.of(log1), PageRequest.of(0, 10), 1);
        when(auditLogRepository.findByVaultId(eq(1L), any(Pageable.class)))
                .thenReturn(page);

        Page<AuditLog> result = auditLogService.getLogsByVaultId(1L, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
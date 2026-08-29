package com.securevault.service;

import com.securevault.entity.AuditLog;
import com.securevault.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        auditLogService = new AuditLogService(auditLogRepository);
    }

    @Test
    @DisplayName("Should create genesis audit log when table is empty")
    void testCreateGenesisAuditLog() {
        when(auditLogRepository.findLatestForUpdate()).thenReturn(Optional.empty());
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuditLog log = auditLogService.createAuditLog(
                "LOG-001",
                "SYSTEM_INIT",
                101L,
                null,
                "Initialized system"
        );

        assertNotNull(log);
        assertEquals("LOG-001", log.getLogId());
        assertEquals("0000000000000000000000000000000000000000000000000000000000000000", log.getPreviousHash());
        assertNotNull(log.getCurrentHash());
        assertEquals(64, log.getCurrentHash().length());
    }

    @Test
    @DisplayName("Should chain hash to latest previous hash when logs exist")
    void testCreateChainedAuditLog() {
        AuditLog previous = new AuditLog();
        previous.setId(1L);
        previous.setLogId("LOG-001");
        previous.setCurrentHash("1111111111111111111111111111111111111111111111111111111111111111");

        when(auditLogRepository.findLatestForUpdate()).thenReturn(Optional.of(previous));
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuditLog log = auditLogService.createAuditLog(
                "LOG-002",
                "VAULT_ACCESS",
                102L,
                501L,
                "Accessed vault"
        );

        assertNotNull(log);
        assertEquals("LOG-002", log.getLogId());
        assertEquals("1111111111111111111111111111111111111111111111111111111111111111", log.getPreviousHash());
        assertNotNull(log.getCurrentHash());
        assertEquals(64, log.getCurrentHash().length());
    }
}

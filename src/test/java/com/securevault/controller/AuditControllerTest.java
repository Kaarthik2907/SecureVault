package com.securevault.controller;

import com.securevault.entity.AuditLog;
import com.securevault.security.JwtUtil;
import com.securevault.service.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuditController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditLogService auditLogService;

    @MockBean
    private JwtUtil jwtUtil;

    private AuditLog sampleLog;

    @BeforeEach
    void setUp() {
        sampleLog = new AuditLog();
        sampleLog.setId(1L);
        sampleLog.setLogId("LOG-001");
        sampleLog.setEventType("VAULT_ACCESS");
        sampleLog.setEmployeeId(101L);
        sampleLog.setVaultId(501L);
        sampleLog.setActionDetails("Accessed vault 501");
        sampleLog.setTimestamp(LocalDateTime.of(2026, 8, 26, 10, 0));
        sampleLog.setPreviousHash("0000000000000000000000000000000000000000000000000000000000000000");
        sampleLog.setCurrentHash("1111111111111111111111111111111111111111111111111111111111111111");
    }

    @Test
    @DisplayName("GET /api/v1/audit/logs without pagination params returns List<AuditLog>")
    void testGetLogsUnpaged() throws Exception {
        when(auditLogService.getHistoricalLogs(eq(null), eq(null), eq(null)))
                .thenReturn(List.of(sampleLog));

        mockMvc.perform(get("/api/v1/audit/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].logId").value("LOG-001"))
                .andExpect(jsonPath("$[0].vaultId").value(501));
    }

    @Test
    @DisplayName("GET /api/v1/audit/logs with pagination returns Page<AuditLog>")
    void testGetLogsPaged() throws Exception {
        PageImpl<AuditLog> page = new PageImpl<>(List.of(sampleLog), PageRequest.of(0, 10), 1);
        when(auditLogService.getHistoricalLogs(eq(501L), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/audit/logs")
                        .param("vaultId", "501")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].logId").value("LOG-001"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/audit/logs/page returns Page<AuditLog>")
    void testGetLogsPageEndpoint() throws Exception {
        PageImpl<AuditLog> page = new PageImpl<>(List.of(sampleLog), PageRequest.of(0, 20), 1);
        when(auditLogService.getHistoricalLogs(eq(501L), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/audit/logs/page")
                        .param("vaultId", "501"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].vaultId").value(501));
    }

    @Test
    @DisplayName("GET /api/v1/audit/vault/{vaultId} returns vault audit logs")
    void testGetLogsByVault() throws Exception {
        when(auditLogService.getHistoricalLogs(eq(501L), eq(null), eq(null)))
                .thenReturn(List.of(sampleLog));

        mockMvc.perform(get("/api/v1/audit/vault/501"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vaultId").value(501));
    }

    @Test
    @DisplayName("GET /api/v1/audit/verify returns verification result")
    void testVerifyChain() throws Exception {
        when(auditLogService.verifyChain())
                .thenReturn(new AuditLogService.VerificationResult(true, "Chain is fully valid.", null));

        mockMvc.perform(get("/api/v1/audit/verify"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isValid").value(true))
                .andExpect(jsonPath("$.message").value("Chain is fully valid."));
    }

    @Test
    @DisplayName("POST /api/v1/audit/reset restores integrity and returns success")
    void testResetChain() throws Exception {
        mockMvc.perform(post("/api/v1/audit/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Audit hash chain integrity successfully restored."));
    }

    @Test
    @DisplayName("POST /api/v1/audit/tamper modifies audit record for security testing")
    void testSimulateTamper() throws Exception {
        when(auditLogService.simulateTamper(any())).thenReturn(sampleLog);

        mockMvc.perform(post("/api/v1/audit/tamper")
                        .contentType("application/json")
                        .content("{\"logId\":\"LOG-001\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logId").value("LOG-001"));
    }
}

package com.securevault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevault.dto.ApprovalDecisionRequest;
import com.securevault.dto.VaultRequestDTO;
import com.securevault.entity.AuditLog;
import com.securevault.entity.Branch;
import com.securevault.entity.User;
import com.securevault.entity.Vault;
import com.securevault.entity.VaultAccessRequest;
import com.securevault.repository.AuditLogRepository;
import com.securevault.repository.BranchRepository;
import com.securevault.repository.UserRepository;
import com.securevault.repository.VaultAccessRequestRepository;
import com.securevault.repository.VaultRepository;
import com.securevault.security.JwtUtil;
import com.securevault.util.HashChainUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AccessRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VaultRepository vaultRepository;

    @Autowired
    private VaultAccessRequestRepository requestRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private User officerUser;
    private User managerUser;
    private Vault testVault;
    private String officerToken;
    private String managerToken;

    @BeforeEach
    void setupData() {
        Branch branch = new Branch();
        branch.setBranchCode("BR-TEST-001");
        branch.setName("Test Financial Branch");
        branch.setCity("Mumbai");
        branch.setAddress("BKC Plot 10");
        branch.setContactNumber("+91-22-12345678");
        branch.setActive(true);
        branch = branchRepository.save(branch);

        officerUser = new User(null, "EMP-OFF-01", "johndoe_test", passwordEncoder.encode("password123"),
                "John Officer", "john.test@securevault.internal", "OFFICER", branch.getId(), true);
        officerUser = userRepository.save(officerUser);

        managerUser = new User(null, "EMP-MGR-01", "sarahsmith_test", passwordEncoder.encode("password123"),
                "Sarah Manager", "sarah.test@securevault.internal", "BRANCH_MANAGER", branch.getId(), true);
        managerUser = userRepository.save(managerUser);

        testVault = new Vault();
        testVault.setVaultCode("VLT-TEST-A1");
        testVault.setBranch(branch);
        testVault.setName("Main Bullion Vault");
        testVault.setSecurityLevel("CRITICAL");
        testVault.setMaxConcurrentAccess(2);
        testVault.setLocked(true);
        testVault = vaultRepository.save(testVault);

        officerToken = "Bearer " + jwtUtil.generateToken(officerUser.getUsername(), officerUser.getRole(), officerUser.getId(), branch.getId());
        managerToken = "Bearer " + jwtUtil.generateToken(managerUser.getUsername(), managerUser.getRole(), managerUser.getId(), branch.getId());
    }

    @Test
    @DisplayName("1. Submit vault access request successfully (201 Created)")
    void testSubmitAccessRequest() throws Exception {
        VaultRequestDTO requestDTO = new VaultRequestDTO(
                testVault.getId(),
                "Quarterly physical bullion audit",
                60
        );

        mockMvc.perform(post("/api/v1/vault-requests")
                        .header("Authorization", officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestId").isNumber())
                .andExpect(jsonPath("$.vaultId").value(testVault.getId()))
                .andExpect(jsonPath("$.requestedById").value(officerUser.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.requestedAt").isNotEmpty());

        // Verify entity persisted in repository
        List<VaultAccessRequest> requests = requestRepository.findByStatusOrderByIdDesc("PENDING");
        assertFalse(requests.isEmpty());
        VaultAccessRequest savedReq = requests.get(0);
        assertEquals("Quarterly physical bullion audit", savedReq.getReason());
        assertEquals(60, savedReq.getEstimatedDurationMinutes());
    }

    @Test
    @DisplayName("2. Retrieve pending requests successfully")
    void testGetPendingRequests() throws Exception {
        VaultAccessRequest pendingReq = new VaultAccessRequest(testVault, officerUser, "Locker calibration", 45);
        requestRepository.save(pendingReq);

        mockMvc.perform(get("/api/v1/vault-requests/pending")
                        .header("Authorization", managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].vaultId").value(testVault.getId()));
    }

    @Test
    @DisplayName("3. Successful approval generates auth code and updates status to APPROVED")
    void testSuccessfulApproval() throws Exception {
        VaultAccessRequest req = new VaultAccessRequest(testVault, officerUser, "Emergency reserve cash inspection", 90);
        req = requestRepository.save(req);

        ApprovalDecisionRequest decision = new ApprovalDecisionRequest("APPROVE", "Approved per protocol schedule");

        mockMvc.perform(post("/api/v1/vault-requests/" + req.getId() + "/approval")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(req.getId()))
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.approvedById").value(managerUser.getId()))
                .andExpect(jsonPath("$.authorizationCode", startsWith("AUTH-")));

        VaultAccessRequest updatedReq = requestRepository.findById(req.getId()).orElseThrow();
        assertEquals("APPROVED", updatedReq.getStatus());
        assertEquals(managerUser.getId(), updatedReq.getApprovedBy().getId());
        assertNotNull(updatedReq.getAuthorizationCode());
        assertTrue(updatedReq.getAuthorizationCode().startsWith("AUTH-"));
    }

    @Test
    @DisplayName("4. Successful denial updates status to REJECTED with no auth code")
    void testSuccessfulDenial() throws Exception {
        VaultAccessRequest req = new VaultAccessRequest(testVault, officerUser, "Unscheduled locker check", 30);
        req = requestRepository.save(req);

        ApprovalDecisionRequest decision = new ApprovalDecisionRequest("REJECT", "Denied: Outside authorized hours");

        mockMvc.perform(post("/api/v1/vault-requests/" + req.getId() + "/approval")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(req.getId()))
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.approvedById").value(managerUser.getId()))
                .andExpect(jsonPath("$.authorizationCode").doesNotExist());

        VaultAccessRequest updatedReq = requestRepository.findById(req.getId()).orElseThrow();
        assertEquals("REJECTED", updatedReq.getStatus());
        assertEquals(managerUser.getId(), updatedReq.getApprovedBy().getId());
        assertNull(updatedReq.getAuthorizationCode());
    }

    @Test
    @DisplayName("5. Rejection of attempts to process a non-pending request returns 400 Bad Request")
    void testRejectProcessingNonPendingRequest() throws Exception {
        VaultAccessRequest req = new VaultAccessRequest(testVault, officerUser, "Inspection", 30);
        req.setStatus("APPROVED");
        req.setAuthorizationCode("AUTH-ALREADY-APPROVED");
        req = requestRepository.save(req);

        ApprovalDecisionRequest decision = new ApprovalDecisionRequest("APPROVE", "Attempt duplicate approval");

        mockMvc.perform(post("/api/v1/vault-requests/" + req.getId() + "/approval")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Request must be PENDING")));
    }

    @Test
    @DisplayName("6. Verification that approval triggers audit log insertion and valid SHA-256 hash-chain")
    void testApprovalTriggersAuditLogInsertionAndHashChaining() throws Exception {
        VaultAccessRequest req = new VaultAccessRequest(testVault, officerUser, "Routine cash transfer", 60);
        req = requestRepository.save(req);

        ApprovalDecisionRequest decision = new ApprovalDecisionRequest("APPROVE", "Approved compliance check");

        mockMvc.perform(post("/api/v1/vault-requests/" + req.getId() + "/approval")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk());

        // Verify audit log entry was generated
        List<AuditLog> auditLogs = auditLogRepository.findAllByOrderByIdAsc();
        assertFalse(auditLogs.isEmpty());

        AuditLog latestAudit = auditLogs.get(auditLogs.size() - 1);
        assertEquals("VAULT_ACCESS_APPROVED", latestAudit.getEventType());
        assertEquals(managerUser.getId(), latestAudit.getEmployeeId());
        assertEquals(testVault.getId(), latestAudit.getVaultId());
        assertNotNull(latestAudit.getPreviousHash());
        assertNotNull(latestAudit.getCurrentHash());
        assertEquals(64, latestAudit.getCurrentHash().length());

        // Mathematically verify that HashChainUtil matches the persisted currentHash
        String expectedHash = HashChainUtil.calculateHash(
                latestAudit.getPreviousHash(),
                latestAudit.getLogId(),
                latestAudit.getEventType(),
                latestAudit.getEmployeeId(),
                latestAudit.getVaultId(),
                latestAudit.getActionDetails(),
                latestAudit.getTimestamp().toString()
        );

        assertEquals(expectedHash, latestAudit.getCurrentHash(), "Audit SHA-256 hash chain must match mathematical computation");
    }
}

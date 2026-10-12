package com.securevault.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevault.dto.ApprovalDecisionRequest;
import com.securevault.dto.LoginRequest;
import com.securevault.entity.Branch;
import com.securevault.entity.User;
import com.securevault.entity.Vault;
import com.securevault.entity.VaultAccessRequest;
import com.securevault.repository.BranchRepository;
import com.securevault.repository.UserRepository;
import com.securevault.repository.VaultAccessRequestRepository;
import com.securevault.repository.VaultRepository;
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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RbacAndEmployeeIntegrationTest {

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

    private Branch testBranch;
    private User officerUser;
    private User managerUser;
    private User adminUser;
    private Vault testVault;
    private VaultAccessRequest pendingRequest;

    private String officerToken;
    private String managerToken;
    private String adminToken;

    @BeforeEach
    void setup() {
        testBranch = new Branch();
        testBranch.setBranchCode("BR-SEC-01");
        testBranch.setName("Security Verification Branch");
        testBranch.setCity("Mumbai");
        testBranch.setAddress("Financial District, BKC");
        testBranch.setContactNumber("+91-22-99887766");
        testBranch.setActive(true);
        testBranch = branchRepository.save(testBranch);

        officerUser = new User(null, "EMP-SEC-01", "officer_alice", passwordEncoder.encode("Password123!"),
                "Alice Officer", "alice@securevault.internal", "OFFICER", testBranch.getId(), true);
        officerUser = userRepository.save(officerUser);

        managerUser = new User(null, "EMP-SEC-02", "manager_bob", passwordEncoder.encode("Password123!"),
                "Bob Manager", "bob@securevault.internal", "BRANCH_MANAGER", testBranch.getId(), true);
        managerUser = userRepository.save(managerUser);

        adminUser = new User(null, "EMP-SEC-03", "admin_charlie", passwordEncoder.encode("Password123!"),
                "Charlie Admin", "charlie@securevault.internal", "ADMIN", testBranch.getId(), true);
        adminUser = userRepository.save(adminUser);

        testVault = new Vault();
        testVault.setVaultCode("VLT-SEC-01");
        testVault.setBranch(testBranch);
        testVault.setName("Secured High Cash Vault");
        testVault.setSecurityLevel("HIGH");
        testVault.setMaxConcurrentAccess(2);
        testVault.setLocked(true);
        testVault = vaultRepository.save(testVault);

        pendingRequest = new VaultAccessRequest(testVault, officerUser, "Emergency audit", 45);
        pendingRequest = requestRepository.save(pendingRequest);

        officerToken = "Bearer " + jwtUtil.generateToken(officerUser.getUsername(), officerUser.getRole(), officerUser.getId(), testBranch.getId());
        managerToken = "Bearer " + jwtUtil.generateToken(managerUser.getUsername(), managerUser.getRole(), managerUser.getId(), testBranch.getId());
        adminToken = "Bearer " + jwtUtil.generateToken(adminUser.getUsername(), adminUser.getRole(), adminUser.getId(), testBranch.getId());
    }

    @Test
    @DisplayName("1. Unauthenticated requests to protected endpoints return 401 Unauthorized")
    void testUnauthenticatedProtectedRequestsReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/employees"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new_emp\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/vault-requests/" + pendingRequest.getId() + "/approval")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"action\":\"APPROVE\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. Authenticated user with insufficient role (OFFICER) receives 403 Forbidden on approval endpoint")
    void testOfficerForbiddenOnApprovalEndpoint() throws Exception {
        ApprovalDecisionRequest decision = new ApprovalDecisionRequest("APPROVE", "Officer trying to approve");

        mockMvc.perform(post("/api/v1/vault-requests/" + pendingRequest.getId() + "/approval")
                        .header("Authorization", officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message", containsString("insufficient permissions")));
    }

    @Test
    @DisplayName("3. Authenticated user with insufficient role (OFFICER) receives 403 Forbidden on employee mutation")
    void testOfficerForbiddenOnEmployeeCreation() throws Exception {
        User newEmployee = new User(null, "EMP-UNAUTH", "unauth_user", "password123",
                "Unauthorized User", "unauth@vault.com", "OFFICER", testBranch.getId(), true);

        mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newEmployee)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("4. Authorized manager (BRANCH_MANAGER) can approve vault access request")
    void testManagerCanApproveAccessRequest() throws Exception {
        ApprovalDecisionRequest decision = new ApprovalDecisionRequest("APPROVE", "Manager approved access");

        mockMvc.perform(post("/api/v1/vault-requests/" + pendingRequest.getId() + "/approval")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.approvedById").value(managerUser.getId()))
                .andExpect(jsonPath("$.authorizationCode", startsWith("AUTH-")));
    }

    @Test
    @DisplayName("5. Authorized admin (ADMIN) can approve vault access request")
    void testAdminCanApproveAccessRequest() throws Exception {
        ApprovalDecisionRequest decision = new ApprovalDecisionRequest("APPROVE", "Admin approved access");

        mockMvc.perform(post("/api/v1/vault-requests/" + pendingRequest.getId() + "/approval")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.authorizationCode").isNotEmpty());
    }

    @Test
    @DisplayName("6. Login returns JWT and employee metadata for valid credentials (both /api/v1/auth/login and /api/auth/login)")
    void testLoginSuccessBothEndpoints() throws Exception {
        LoginRequest request = new LoginRequest("officer_alice", "Password123!");

        // Contract path /api/v1/auth/login
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("officer_alice"))
                .andExpect(jsonPath("$.role").value("OFFICER"))
                .andExpect(jsonPath("$.employeeId").value(officerUser.getId()))
                .andExpect(jsonPath("$.branchId").value(testBranch.getId()));

        // Alternate path /api/auth/login
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("7. Invalid login credentials are rejected with 401 Unauthorized")
    void testInvalidLoginCredentialsRejected() throws Exception {
        // Wrong password
        LoginRequest badPassword = new LoginRequest("officer_alice", "WrongPassword999!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPassword)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        // Non-existent user
        LoginRequest nonExistent = new LoginRequest("ghost_user", "SomePassword123!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nonExistent)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("8. Employee creation, role assignment (OFFICER, MANAGER, ADMIN), and updates work correctly")
    void testEmployeeManagementLifecycle() throws Exception {
        // 8a. Manager creates new employee with role MANAGER
        String createJson = """
                {
                    "employeeCode": "EMP-NEW-77",
                    "username": "manager_david",
                    "password": "customPassword123!",
                    "fullName": "David Deputy",
                    "email": "david@securevault.internal",
                    "role": "MANAGER",
                    "branchId": %d,
                    "isActive": true
                }
                """.formatted(testBranch.getId());

        String createResponse = mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.username").value("manager_david"))
                .andExpect(jsonPath("$.role").value("MANAGER"))
                .andExpect(jsonPath("$.isActive").value(true))
                .andReturn().getResponse().getContentAsString();

        Long createdId = objectMapper.readTree(createResponse).get("id").asLong();

        // 8b. Update employee: promote role to ADMIN and update name
        User updatePayload = new User(null, "EMP-NEW-77", "manager_david", "newPass456!",
                "David Senior Admin", "david.admin@securevault.internal", "ADMIN", testBranch.getId(), true);

        mockMvc.perform(put("/api/v1/employees/" + createdId)
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdId))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.fullName").value("David Senior Admin"));

        // 8c. Verify getEmployeeById returns updated role and details
        mockMvc.perform(get("/api/v1/employees/" + createdId)
                        .header("Authorization", officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.fullName").value("David Senior Admin"))
                .andExpect(jsonPath("$.isActive").value(true));

        // 8d. Test alternate endpoint /api/employees works
        mockMvc.perform(get("/api/employees")
                        .header("Authorization", officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }
}

package com.securevault.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevault.dto.LoginRequest;
import com.securevault.entity.User;
import com.securevault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        User user = new User(101L, "EMP-0101", "johndoe", passwordEncoder.encode("SecurePassword123!"),
                "John Doe", "johndoe@securevault.internal", "OFFICER", 1L, true);

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
    }

    @Test
    @DisplayName("Public endpoint /api/v1/auth/login should be accessible without token")
    void testPublicLoginEndpoint() throws Exception {
        LoginRequest request = new LoginRequest("johndoe", "SecurePassword123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("johndoe"))
                .andExpect(jsonPath("$.employeeId").value(101));
    }

    @Test
    @DisplayName("Secured endpoint /api/v1/vault-requests should reject request without token with 401")
    void testSecuredEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/vault-requests/pending"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Secured endpoint /api/v1/vault-requests with valid JWT Bearer token should pass filter")
    void testSecuredEndpointWithValidToken() throws Exception {
        String token = jwtUtil.generateToken("johndoe", "OFFICER", 101L, 1L);

        // Without a controller for vault-requests yet, passing security filter returns 404 (Resource not found), NOT 401 Unauthorized
        mockMvc.perform(get("/api/v1/vault-requests/pending")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}

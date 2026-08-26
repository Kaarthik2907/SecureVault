package com.securevault.security;

import com.securevault.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long TEST_EXPIRATION = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(TEST_SECRET, TEST_EXPIRATION);
    }

    @Test
    @DisplayName("Should generate token from User entity and extract valid claims")
    void testGenerateTokenFromUser() {
        User user = new User(101L, "EMP-0101", "johndoe", "hashed_pwd", "John Doe",
                "johndoe@securevault.internal", "OFFICER", 1L, true);

        String token = jwtUtil.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("johndoe", jwtUtil.extractUsername(token));
        assertEquals("OFFICER", jwtUtil.extractRole(token));
        assertEquals(101L, jwtUtil.extractEmployeeId(token));
        assertEquals(1L, jwtUtil.extractBranchId(token));
        assertTrue(jwtUtil.validateToken(token, "johndoe"));
        assertTrue(jwtUtil.validateToken(token));
        assertFalse(jwtUtil.validateToken(token, "wronguser"));
        assertFalse(jwtUtil.isTokenExpired(token));
    }

    @Test
    @DisplayName("Should generate token from explicit parameters")
    void testGenerateTokenFromParams() {
        String token = jwtUtil.generateToken("sarahsmith", "BRANCH_MANAGER", 102L, 1L);

        assertNotNull(token);
        assertEquals("sarahsmith", jwtUtil.extractUsername(token));
        assertEquals("BRANCH_MANAGER", jwtUtil.extractRole(token));
        assertEquals(102L, jwtUtil.extractEmployeeId(token));
        assertEquals(1L, jwtUtil.extractBranchId(token));
        assertTrue(jwtUtil.validateToken(token, "sarahsmith"));
    }

    @Test
    @DisplayName("Should identify expired token")
    void testExpiredToken() {
        // Create JwtUtil with -1000ms expiration (already expired)
        JwtUtil expiredJwtUtil = new JwtUtil(TEST_SECRET, -1000L);
        String token = expiredJwtUtil.generateToken("johndoe", "OFFICER", 101L, 1L);

        assertTrue(jwtUtil.isTokenExpired(token));
        assertFalse(jwtUtil.validateToken(token, "johndoe"));
    }
}

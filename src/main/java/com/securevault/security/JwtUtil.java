package com.securevault.security;

import com.securevault.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility component for generating, signing, parsing, and validating JWT tokens (HMAC-SHA256).
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret,
            @Value("${jwt.expirationMs:86400000}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Generates a signed JWT token for a given User entity.
     *
     * @param user The user entity containing credentials and metadata.
     * @return A signed JWT compact string.
     */
    public String generateToken(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("username", user.getUsername());
        extraClaims.put("role", user.getRole());
        extraClaims.put("employeeId", user.getEmployeeId());
        if (user.getBranchId() != null) {
            extraClaims.put("branchId", user.getBranchId());
        }
        return createToken(extraClaims, user.getUsername());
    }

    /**
     * Generates a signed JWT token with explicit claims.
     *
     * @param username   The username.
     * @param role       The employee role.
     * @param employeeId The employee database identifier.
     * @param branchId   The branch identifier.
     * @return A signed JWT compact string.
     */
    public String generateToken(String username, String role, Long employeeId, Long branchId) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("username", username);
        extraClaims.put("role", role);
        extraClaims.put("employeeId", employeeId);
        if (branchId != null) {
            extraClaims.put("branchId", branchId);
        }
        return createToken(extraClaims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Extracts all claims from a JWT token.
     *
     * @param token The signed JWT token.
     * @return The token's claims body.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts a single claim from a token using a resolver function.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts the subject/username from the token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the role claim from the token.
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extracts the employeeId claim from the token.
     */
    public Long extractEmployeeId(String token) {
        return extractClaim(token, claims -> {
            Object empId = claims.get("employeeId");
            if (empId instanceof Number number) {
                return number.longValue();
            }
            return null;
        });
    }

    /**
     * Extracts the branchId claim from the token.
     */
    public Long extractBranchId(String token) {
        return extractClaim(token, claims -> {
            Object branchId = claims.get("branchId");
            if (branchId instanceof Number number) {
                return number.longValue();
            }
            return null;
        });
    }

    /**
     * Extracts the expiration date from the token.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Verifies if the token has expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Validates if the token belongs to the specified username and is not expired.
     */
    public boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return (extractedUsername != null && extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Validates if the token is properly signed and not expired.
     */
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

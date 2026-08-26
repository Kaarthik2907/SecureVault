package com.securevault.service;

import com.securevault.dto.LoginRequest;
import com.securevault.dto.LoginResponse;
import com.securevault.entity.User;
import com.securevault.repository.UserRepository;
import com.securevault.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling user authentication and JWT token generation.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Authenticates employee credentials and returns signed JWT token with metadata.
     *
     * @param request Login credentials (username, password).
     * @return LoginResponse containing JWT and user details.
     * @throws BadCredentialsException If username not found or password does not match.
     * @throws DisabledException       If account is inactive.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        if (request == null || request.username() == null || request.password() == null) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isEnabled()) {
            throw new DisabledException("Account is disabled. Please contact your system administrator.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user);

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole(),
                user.getEmployeeId(),
                user.getBranchId()
        );
    }
}

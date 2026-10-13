package com.securevault.service;

import com.securevault.dto.ApprovalDecisionRequest;
import com.securevault.dto.ApprovalDecisionResponse;
import com.securevault.dto.VaultRequestDTO;
import com.securevault.dto.VaultRequestResponse;
import com.securevault.entity.User;
import com.securevault.entity.Vault;
import com.securevault.entity.VaultAccessRequest;
import com.securevault.repository.UserRepository;
import com.securevault.repository.VaultAccessRequestRepository;
import com.securevault.repository.VaultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of AccessRequestService managing vault access lifecycles,
 * authorizations, and mathematical SHA-256 audit chaining.
 */
@Service
public class AccessRequestServiceImpl implements AccessRequestService {

    private final VaultAccessRequestRepository requestRepository;
    private final VaultRepository vaultRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AccessRequestServiceImpl(
            VaultAccessRequestRepository requestRepository,
            VaultRepository vaultRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.requestRepository = requestRepository;
        this.vaultRepository = vaultRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public VaultRequestResponse submitRequest(VaultRequestDTO dto, String requesterUsername) {
        Vault vault = vaultRepository.findById(dto.vaultId())
                .orElseThrow(() -> new IllegalArgumentException("Vault not found with ID: " + dto.vaultId()));

        User requester = resolveUser(requesterUsername, dto.requestedById());

        VaultAccessRequest request = new VaultAccessRequest();
        request.setVault(vault);
        request.setRequestedBy(requester);
        request.setReason(dto.reason());
        request.setEstimatedDurationMinutes(dto.estimatedDurationMinutes());
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());

        VaultAccessRequest saved = requestRepository.save(request);

        // Audit chain record for access request submission
        String logId = generateLogId();
        String details = String.format("Request #%d submitted by %s for Vault %s",
                saved.getId(), requester.getUsername(), vault.getVaultCode());
        auditLogService.createAuditLog(
                logId,
                "VAULT_ACCESS_REQUESTED",
                requester.getId(),
                vault.getId(),
                details
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaultRequestResponse> getPendingRequests(Long branchId) {
        List<VaultAccessRequest> requests;
        if (branchId != null) {
            requests = requestRepository.findByStatusAndVaultBranchIdOrderByIdDesc("PENDING", branchId);
        } else {
            requests = requestRepository.findByStatusOrderByIdDesc("PENDING");
        }
        return requests.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaultRequestResponse> getAllRequests() {
        return requestRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VaultRequestResponse getRequestById(Long id) {
        VaultAccessRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vault access request not found with ID: " + id));
        return mapToResponse(request);
    }

    @Override
    @Transactional
    public ApprovalDecisionResponse processDecision(Long requestId, ApprovalDecisionRequest decision, String approverUsername) {
        VaultAccessRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Vault access request not found with ID: " + requestId));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Cannot process request with status: " + request.getStatus() + ". Request must be PENDING.");
        }

        User approver = resolveUser(approverUsername, decision.approvedById());

        boolean isApprove = "APPROVE".equalsIgnoreCase(decision.action());
        String newStatus = isApprove ? "APPROVED" : "REJECTED";
        String authCode = isApprove ? generateAuthorizationCode() : null;

        request.setStatus(newStatus);
        request.setApprovedBy(approver);
        request.setRemarks(decision.remarks());
        request.setApprovedAt(LocalDateTime.now());
        request.setAuthorizationCode(authCode);

        VaultAccessRequest updated = requestRepository.save(request);

        // Audit chain record for approval or denial
        String logId = generateLogId();
        String eventType = isApprove ? "VAULT_ACCESS_APPROVED" : "VAULT_ACCESS_REJECTED";
        String details = isApprove
                ? String.format("Request #%d approved by %s. Auth Code: %s generated.",
                        updated.getId(), approver.getUsername(), authCode)
                : String.format("Request #%d rejected by %s. Remarks: %s",
                        updated.getId(), approver.getUsername(), decision.remarks() != null ? decision.remarks() : "No remarks");

        auditLogService.createAuditLog(
                logId,
                eventType,
                approver.getId(),
                updated.getVault().getId(),
                details
        );

        return new ApprovalDecisionResponse(
                updated.getId(),
                updated.getStatus(),
                approver.getId(),
                updated.getAuthorizationCode()
        );
    }

    @Override
    @Transactional
    public com.securevault.dto.VaultExecuteResponse executeRequest(Long requestId, String authorizationCode, String executorUsername) {
        VaultAccessRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Vault access request not found with ID: " + requestId));

        if (!"APPROVED".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Cannot unlock vault. Request status is " + request.getStatus() + ". Request must be APPROVED.");
        }

        if (authorizationCode == null || !authorizationCode.trim().equalsIgnoreCase(request.getAuthorizationCode())) {
            throw new IllegalArgumentException("Invalid cryptographic authorization code.");
        }

        // 1. Unlock the physical vault
        Vault vault = request.getVault();
        if (vault != null) {
            vault.setLocked(false);
            vaultRepository.save(vault);
        }

        // 2. Mark request as ACCESSED
        request.setStatus("ACCESSED");
        VaultAccessRequest updated = requestRepository.save(request);

        // 3. Cryptographic hash chain write for terminal vault unlock
        User executor = resolveUser(executorUsername, request.getRequestedBy() != null ? request.getRequestedBy().getId() : null);
        String logId = generateLogId();
        String details = String.format("Physical Vault #%d unlocked using Auth Code %s. Session duration started: %dm.",
                vault != null ? vault.getId() : requestId, authorizationCode.trim(), request.getEstimatedDurationMinutes());

        com.securevault.entity.AuditLog auditLog = auditLogService.createAuditLog(
                logId,
                "VAULT_UNLOCKED",
                executor.getId(),
                vault != null ? vault.getId() : null,
                details
        );

        return new com.securevault.dto.VaultExecuteResponse(
                true,
                String.format("Vault #%d successfully unlocked!", vault != null ? vault.getId() : requestId),
                vault != null ? vault.getId() : null,
                auditLog
        );
    }

    private User resolveUser(String username, Long fallbackUserId) {
        if (username != null && !username.isBlank()) {
            return userRepository.findByUsername(username)
                    .orElseGet(() -> resolveById(fallbackUserId));
        }
        return resolveById(fallbackUserId);
    }

    private User resolveById(Long id) {
        if (id != null) {
            return userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
        }
        // Fallback to first available employee if none supplied
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No employees available in database"));
    }

    private String generateAuthorizationCode() {
        String randomHex = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        int year = LocalDate.now().getYear();
        return "AUTH-" + randomHex + "-" + year;
    }

    private String generateLogId() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "LOG-" + dateStr + "-" + randomSuffix;
    }

    private VaultRequestResponse mapToResponse(VaultAccessRequest req) {
        return new VaultRequestResponse(
                req.getId(),
                req.getVault() != null ? req.getVault().getId() : null,
                req.getRequestedBy() != null ? req.getRequestedBy().getId() : null,
                req.getStatus(),
                req.getRequestedAt(),
                req.getReason(),
                req.getEstimatedDurationMinutes(),
                req.getAuthorizationCode(),
                req.getApprovedBy() != null ? req.getApprovedBy().getId() : null,
                req.getRemarks(),
                req.getApprovedAt()
        );
    }
}
